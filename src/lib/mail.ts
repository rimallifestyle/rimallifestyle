import nodemailer from "nodemailer";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export interface SMTPSettings {
  host: string;
  port: string | number;
  secure?: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
  admin2FA?: boolean;
}

export async function getSMTPSettings(): Promise<SMTPSettings | null> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: "smtp_settings" });
    if (setting && setting.value) {
      const v = setting.value;
      if (v.host && v.user && v.pass) {
        return {
          host: v.host,
          port: v.port || "465",
          secure: v.port === "465" || v.port === 465 || v.secure === true,
          user: v.user,
          pass: v.pass,
          fromName: v.fromName || "Rimal Store",
          fromEmail: v.fromEmail || v.user,
          admin2FA: v.admin2FA !== false, // default enabled
        };
      }
    }
  } catch (err) {
    console.error("Error reading SMTP settings:", err);
  }
  return null;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const smtp = await getSMTPSettings();
  if (!smtp) {
    throw new Error("SMTP settings not configured in Admin Dashboard.");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"${smtp.fromName || "Rimal Store"}" <${smtp.fromEmail || smtp.user}>`,
    to,
    subject,
    text: text || "Your verification code from Rimal",
    html,
  };

  return await transporter.sendMail(mailOptions);
}

// ----------------- LUXURY EMAIL TEMPLATES -----------------

export function getAdminLoginOTPEmail(otp: string, name?: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login Verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0202; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f0e6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0202; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 520px; background-color: #140505; border: 1px solid #3d1414; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px 20px 30px; text-align: center; border-bottom: 1px solid #2a0e0e;">
                <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 32px; letter-spacing: 0.15em; color: #d4af37; text-transform: uppercase;">RIMAL</h1>
                <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.3em; color: #a89f91; text-transform: uppercase;">Atelier &bull; Security Verification</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 35px 35px 25px 35px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e8e0d5;">
                  Hello ${name ? name : "Administrator"},
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b8aea2;">
                  A login attempt to your <strong>Rimal Store Admin Dashboard</strong> was detected. Please use the one-time 2FA security code below to complete your authentication:
                </p>

                <!-- OTP Code Display -->
                <div style="margin: 30px 0; text-align: center;">
                  <div style="display: inline-block; background-color: #080101; border: 2px solid #d4af37; border-radius: 14px; padding: 18px 36px; box-shadow: 0 0 25px rgba(212,175,55,0.2);">
                    <span style="font-family: monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.35em; color: #d4af37; text-shadow: 0 0 10px rgba(212,175,55,0.4);">${otp}</span>
                  </div>
                </div>

                <p style="margin: 20px 0 0 0; font-size: 12px; color: #8a7e70; text-align: center;">
                  This code expires in <strong style="color: #d4af37;">10 minutes</strong>. Never share this code with anyone.
                </p>
              </td>
            </tr>

            <!-- Footer Warning -->
            <tr>
              <td style="padding: 20px 35px 30px 35px; background-color: #0d0303; border-top: 1px solid #240a0a; text-align: center;">
                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6e6458;">
                  If you did not initiate this login request, please change your password immediately.
                  <br>&copy; ${new Date().getFullYear()} Rimal Store. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function getPasswordResetOTPEmail(otp: string, name?: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0202; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f0e6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0202; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 520px; background-color: #140505; border: 1px solid #3d1414; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px 20px 30px; text-align: center; border-bottom: 1px solid #2a0e0e;">
                <h1 style="margin: 0; font-family: 'Times New Roman', serif; font-size: 32px; letter-spacing: 0.15em; color: #d4af37; text-transform: uppercase;">RIMAL</h1>
                <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.3em; color: #a89f91; text-transform: uppercase;">Password Reset Request</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 35px 35px 25px 35px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e8e0d5;">
                  Hello ${name ? name : "there"},
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b8aea2;">
                  We received a request to reset your password. Use the 6-digit verification code below to set a new password:
                </p>

                <!-- OTP Code Display -->
                <div style="margin: 30px 0; text-align: center;">
                  <div style="display: inline-block; background-color: #080101; border: 2px solid #d4af37; border-radius: 14px; padding: 18px 36px; box-shadow: 0 0 25px rgba(212,175,55,0.2);">
                    <span style="font-family: monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.35em; color: #d4af37; text-shadow: 0 0 10px rgba(212,175,55,0.4);">${otp}</span>
                  </div>
                </div>

                <p style="margin: 20px 0 0 0; font-size: 12px; color: #8a7e70; text-align: center;">
                  This code expires in <strong style="color: #d4af37;">10 minutes</strong>. If you did not request this change, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer Warning -->
            <tr>
              <td style="padding: 20px 35px 30px 35px; background-color: #0d0303; border-top: 1px solid #240a0a; text-align: center;">
                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6e6458;">
                  &copy; ${new Date().getFullYear()} Rimal Store. Modern Luxury &amp; Timeless Craft.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
