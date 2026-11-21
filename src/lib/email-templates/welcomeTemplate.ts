export const getWelcomeEmailTemplate = (name: string) => `
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
                Welcome to Rimal Lifestyle
              </h2>
              <p style="margin: 0 0 20px 0; color: #A09D98; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 30px 0; color: #A09D98; font-size: 15px; line-height: 1.6;">
                We are thrilled to have you here. At Rimal Lifestyle, we aim to provide the best premium collections tailored for your modern lifestyle.
              </p>
              
              <!-- CTA Button -->
              <div style="margin-bottom: 30px;">
                <a href="https://yourwebsite.com/shop" style="display: inline-block; background-color: #D4AF37; color: #33040D; text-decoration: none; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 8px;">
                  Start Shopping
                </a>
              </div>
              
              <p style="margin: 0; color: #A09D98; font-size: 14px; line-height: 1.5;">
                If you have any questions, simply reply to this email. We'd love to help.
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
