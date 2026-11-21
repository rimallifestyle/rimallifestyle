/**
 * Global interface for the injected settings
 */
declare global {
  interface Window {
    rimalSettings?: {
      root: string;
      nonce: string;
    };
  }
}

/**
 * Base URL for the REST API.
 */
export const API_ROOT = (typeof window !== "undefined" && window.rimalSettings?.root) || "/api/";

/**
 * A wrapper around `fetch` for all API requests.
 */
export async function wpFetch(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  // Attach Bearer token if logged in
  const token = localStorage.getItem("rimal_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Admin API helper: fetch data with authentication token
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rimal_token') : null

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.append('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'An error occurred during the request')
  }

  return response.json()
}

/**
 * Admin API helper: Upload an image
 */
export async function uploadImageToWP(file: File): Promise<{ id: number; source_url: string }> {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('rimal_token') : null

  const headers = new Headers()
  if (token) {
    headers.append('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_ROOT}upload`, {
    method: 'POST',
    headers: headers,
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Image upload failed')
  }

  const data = await response.json()
  return { id: Date.now(), source_url: data.url }
}
