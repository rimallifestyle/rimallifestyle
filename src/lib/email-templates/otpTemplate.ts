export const getOTPEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: 'Inter', sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F7F5F0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #33040D; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #D4AF37; font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px;">
                Rimal
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #F7F5F0; font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600;">
                Verify Your Email
              </h2>
              <p style="margin: 0 0 30px 0; color: #A09D98; font-size: 15px; line-height: 1.6;">
                You are almost there. To complete your registration, please use the 6-digit verification code below.
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #D4AF37; font-size: 40px; font-weight: 700; letter-spacing: 12px; text-align: center;">
                  ${otp}
                </h1>
              </div>
              
              <p style="margin: 0; color: #A09D98; font-size: 14px;">
                This code will expire in 5 minutes. If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: #706D68; font-size: 12px;">
                © ${new Date().getFullYear()} Rimal Lifestyle. All rights reserved.
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
