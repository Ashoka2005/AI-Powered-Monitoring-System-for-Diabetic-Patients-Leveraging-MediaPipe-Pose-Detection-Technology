const nodemailer = require('nodemailer');
const axios = require('axios');

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

// Verify SMTP connection config on startup (only if Resend is not configured)
if (!process.env.RESEND_API_KEY && process.env.SMTP_USER) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP Connection Warning:', error.message);
    } else {
      console.log('SMTP server is ready to deliver emails');
    }
  });
} else if (process.env.RESEND_API_KEY) {
  console.log('Resend HTTP API key detected. Real email delivery will use Resend.');
} else {
  console.log('No email service configured. Real email delivery is disabled.');
}

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    // 1. If RESEND_API_KEY is configured in environment variables, use Resend API (perfect for Render)
    if (process.env.RESEND_API_KEY) {
      console.log(`[Email Service] Dispatching email to ${to} via Resend HTTP API...`);
      
      // Resend Free Tier sandbox requires sender to be onboarding@resend.dev unless domain is verified
      const sender = process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes('@') && !process.env.EMAIL_FROM.includes('gmail.com') 
        ? process.env.EMAIL_FROM 
        : 'onboarding@resend.dev';

      await axios.post('https://api.resend.com/emails', {
        from: `DiaFit AI <${sender}>`,
        to,
        subject,
        html
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[Email Service] Email sent successfully via Resend API!');
      return;
    }

    // 2. Fallback to Gmail SMTP for local testing
    if (!process.env.SMTP_USER) {
      console.log('Email service not configured, skipping email');
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    console.log('[Email Service] Email sent successfully via SMTP!');
  } catch (error) {
    console.error('Email send error:', error.response?.data || error.message);
  }
};

module.exports = { sendEmail };
