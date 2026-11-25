import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export interface SteadfastConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
  isActive: boolean;
}

export interface PathaoConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId?: string;
  baseUrl?: string;
  isActive: boolean;
}

export interface CourierSettings {
  steadfast: SteadfastConfig;
  pathao: PathaoConfig;
}

export const DEFAULT_COURIER_SETTINGS: CourierSettings = {
  steadfast: {
    apiKey: '',
    secretKey: '',
    baseUrl: 'https://portal.steadfast.com.bd/api/v1',
    isActive: false,
  },
  pathao: {
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    storeId: '',
    baseUrl: 'https://api-hermes.pathao.com/aladdin/api/v1',
    isActive: false,
  },
};

/**
 * Fetch Courier Settings from DB
 */
export async function getCourierSettings(): Promise<CourierSettings> {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'courier_settings' });
  if (!setting || !setting.value) {
    return DEFAULT_COURIER_SETTINGS;
  }
  return {
    steadfast: {
      ...DEFAULT_COURIER_SETTINGS.steadfast,
      ...(setting.value.steadfast || {}),
    },
    pathao: {
      ...DEFAULT_COURIER_SETTINGS.pathao,
      ...(setting.value.pathao || {}),
    },
  };
}

/**
 * Save Courier Settings to DB
 */
export async function saveCourierSettings(settings: CourierSettings) {
  await connectToDatabase();
  return await Setting.findOneAndUpdate(
    { key: 'courier_settings' },
    { key: 'courier_settings', value: settings },
    { upsert: true, new: true }
  );
}

/**
 * Test Steadfast Connection (Check Balance)
 */
export async function testSteadfastConnection(apiKey: string, secretKey: string, baseUrl?: string) {
  if (!apiKey || !secretKey) {
    return { success: false, message: 'API Key and Secret Key are required.' };
  }
  const url = (baseUrl || 'https://portal.steadfast.com.bd/api/v1').replace(/\/+$/, '') + '/get_balance';

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.status === 200 || data.current_balance !== undefined)) {
      return {
        success: true,
        message: `Connected successfully to Steadfast! Current Balance: ৳ ${data.current_balance ?? 0}`,
        balance: data.current_balance ?? 0,
      };
    }

    const errorMsg = data?.message || data?.errors || (res.status === 401 ? 'Invalid API Key or Secret Key' : `Error ${res.status}: ${res.statusText}`);
    return {
      success: false,
      message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to reach Steadfast server.',
    };
  }
}

/**
 * Create Steadfast Order
 */
export async function createSteadfastOrder({
  apiKey,
  secretKey,
  baseUrl,
  invoice,
  recipientName,
  recipientPhone,
  recipientAddress,
  codAmount,
  note,
}: {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}) {
  if (!apiKey || !secretKey) {
    return { success: false, message: 'Steadfast API Key or Secret Key is missing. Please configure credentials first.' };
  }

  const url = (baseUrl || 'https://portal.steadfast.com.bd/api/v1').replace(/\/+$/, '') + '/create_order';

  const payload = {
    invoice: invoice.trim(),
    recipient_name: recipientName.trim(),
    recipient_phone: recipientPhone.trim(),
    recipient_address: recipientAddress.trim(),
    cod_amount: Number(codAmount) || 0,
    note: (note || 'Handle with care - Rimal Lifestyle').trim(),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.status === 200 || data.consignment)) {
      return {
        success: true,
        message: data.message || 'Steadfast order created successfully',
        consignment: data.consignment,
        trackingCode: data.consignment?.tracking_code,
        consignmentId: data.consignment?.consignment_id,
        raw: data,
      };
    }

    let errorMsg = 'Failed to create order in Steadfast';
    if (data?.errors) {
      if (typeof data.errors === 'object') {
        const errorList = Object.entries(data.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
        errorMsg = errorList.join('; ');
      } else {
        errorMsg = String(data.errors);
      }
    } else if (data?.message) {
      errorMsg = data.message;
    } else if (res.status === 401) {
      errorMsg = 'Steadfast authentication failed (401). Please check your API credentials.';
    }

    return {
      success: false,
      message: errorMsg,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error while contacting Steadfast.',
    };
  }
}

/**
 * Test Pathao Connection (Issue Token)
 */
export async function testPathaoConnection(config: {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  baseUrl?: string;
}) {
  const { clientId, clientSecret, username, password, baseUrl } = config;
  if (!clientId || !clientSecret || !username || !password) {
    return { success: false, message: 'Client ID, Secret, Username and Password are required for Pathao.' };
  }

  const url = (baseUrl || 'https://api-hermes.pathao.com/aladdin/api/v1').replace(/\/+$/, '') + '/issue-token';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        username: username.trim(),
        password: password.trim(),
        grant_type: 'password',
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.access_token) {
      return {
        success: true,
        message: 'Connected successfully to Pathao!',
        accessToken: data.access_token,
      };
    }

    return {
      success: false,
      message: data?.message || data?.error_description || (res.status === 401 ? 'Pathao credentials rejected.' : `Error: ${res.statusText}`),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to reach Pathao server.',
    };
  }
}

/**
 * Create Pathao Order
 */
export async function createPathaoOrder({
  config,
  invoice,
  recipientName,
  recipientPhone,
  recipientAddress,
  codAmount,
  note,
}: {
  config: PathaoConfig;
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}) {
  const tokenRes = await testPathaoConnection(config);
  if (!tokenRes.success || !tokenRes.accessToken) {
    return { success: false, message: `Pathao Auth Failed: ${tokenRes.message}` };
  }

  const url = (config.baseUrl || 'https://api-hermes.pathao.com/aladdin/api/v1').replace(/\/+$/, '') + '/orders';

  const payload = {
    store_id: config.storeId ? Number(config.storeId) : undefined,
    merchant_order_id: invoice,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_address: recipientAddress,
    recipient_city: 1, // Default City (Dhaka)
    recipient_zone: 1, // Default Zone
    amount_to_collect: Number(codAmount) || 0,
    item_type: 1, // Parcel
    delivery_type: 48, // Normal 48h
    item_weight: 0.5,
    item_quantity: 1,
    item_description: note || 'Package from Rimal Lifestyle',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenRes.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && (data?.type === 'success' || data?.data?.consignment_id)) {
      return {
        success: true,
        message: data.message || 'Order dispatched to Pathao successfully',
        consignmentId: data?.data?.consignment_id,
        trackingCode: data?.data?.consignment_id,
        raw: data,
      };
    }

    return {
      success: false,
      message: data?.message || JSON.stringify(data?.errors || 'Failed to create Pathao order'),
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to contact Pathao API',
    };
  }
}
