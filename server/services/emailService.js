const nodemailer = require('nodemailer');

// Configure test/ethereal or SMTP transport
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate test Ethereal account if no SMTP provided
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Ethereal test mailer initialized for alerts');
    } catch (e) {
      console.warn('⚠️ Could not initialize Ethereal mailer, email notifications will be logged to console.');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('📧 [SIMULATED EMAIL SENT]', mailOptions);
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    }
  }

  return transporter;
};

const sendPriceAlertConfirmation = async (userEmail, userName, productName, targetPrice, currentPrice) => {
  try {
    const mail = await getTransporter();
    const info = await mail.sendMail({
      from: '"⚡ DropX Alerts" <alerts@dropx.com>',
      to: userEmail,
      subject: `🔔 Price Alert Created: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px;">
          <h2 style="color: #38bdf8; margin-top: 0;">⚡ DropX Price Alert Confirmed!</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>You've successfully set up a price alert on DropX.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #ffffff;">${productName}</p>
            <p style="margin: 4px 0; color: #94a3b8;">Current Price: <span style="color: #cbd5e1; font-weight: 600;">₹${currentPrice.toLocaleString('en-IN')}</span></p>
            <p style="margin: 4px 0; color: #38bdf8; font-weight: bold;">Target Alert Price: ₹${targetPrice.toLocaleString('en-IN')}</p>
          </div>
          <p>We'll continuously monitor Amazon, Flipkart, and Croma and send you an instant email the moment this item drops to or below your target price!</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Track Prices. Catch Drops. Save Money. — DropX</p>
        </div>
      `
    });
    console.log(`✅ Alert confirmation sent to ${userEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email alert sending error:', error.message);
  }
};

module.exports = {
  sendPriceAlertConfirmation
};
