const nodemailer = require('nodemailer');

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

// Verify SMTP connection config on startup
if (process.env.SMTP_USER) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP Connection Warning:', error.message);
    } else {
      console.log('SMTP server is ready to deliver emails');
    }
  });
} else {
  console.log('SMTP_USER not configured in .env. Real email delivery is disabled.');
}

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
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
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

module.exports = { sendEmail };
