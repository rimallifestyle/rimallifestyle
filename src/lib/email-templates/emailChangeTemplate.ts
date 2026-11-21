export const getEmailChangeOTPTemplate = (otp: string, name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your New Email</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #33040D;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #D4AF37;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #33040D;
        }
        .message {
            font-size: 15px;
            margin-bottom: 30px;
            color: #555555;
        }
        .otp-container {
            text-align: center;
            margin: 35px 0;
        }
        .otp-code {
            background-color: rgba(212, 175, 55, 0.1);
            color: #33040D;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 15px 30px;
            border-radius: 6px;
            border: 1px solid rgba(212, 175, 55, 0.3);
            display: inline-block;
        }
        .warning {
            font-size: 13px;
            color: #888888;
            margin-top: 30px;
            text-align: center;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RIMAL STORE</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${name},</div>
            
            <div class="message">
                We received a request to change the email address associated with your Rimal Store account. 
                Please use the verification code below to confirm this new email address.
            </div>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
                This code will expire in 10 minutes. If you did not request this change, please ignore this email or contact support if you have concerns.
            </div>
        </div>
        
        <div class="footer">
            &copy; ${new Date().getFullYear()} Rimal Store. All rights reserved.
        </div>
    </div>
</body>
</html>
`;
