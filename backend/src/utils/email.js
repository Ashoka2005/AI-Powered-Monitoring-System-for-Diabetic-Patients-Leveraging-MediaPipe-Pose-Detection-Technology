const nodemailer = require('nodemailer');
const axios = require('axios');

let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✓ [Email Service] Initialized Ethereal fallback account: ${testAccount.user}`);
    return etherealTransporter;
  } catch (err) {
    console.warn('Failed to create Ethereal test account:', err.message);
    return null;
  }
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  // 1. Direct Primary SMTP (Gmail or custom SMTP - Priority #1)
  const cleanPass = (process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || 'xfhxtlxplujwuajz').trim().replace(/\s+/g, '');
  const smtpUser = (process.env.SMTP_USER || 'a09022762@gmail.com').trim();
  if (smtpUser && cleanPass) {
    try {
      const port = parseInt(process.env.SMTP_PORT) || 587;
      const is465 = port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: is465,
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: false },
      });

      console.log(`[Email Service] Dispatching email to ${to} via Primary SMTP (${process.env.SMTP_HOST || 'smtp.gmail.com'})...`);
      const info = await transporter.sendMail({
        from: `"DiaFit AI Healthcare" <${process.env.EMAIL_FROM || smtpUser}>`,
        to,
        subject,
        html,
        attachments,
      });
      console.log('✓ [Email Service] Real email delivered successfully via Primary SMTP! MessageId:', info.messageId);
      return true;
    } catch (error) {
      console.warn('⚠️ [Email Service] Primary SMTP delivery failed:', error.message);
    }
  }

  // 2. Brevo HTTP API (if standard API key starting with xkeysib- is provided)
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoKey && !brevoKey.startsWith('xsmtpsib-')) {
    try {
      console.log(`[Email Service] Dispatching email to ${to} via Brevo HTTP API...`);
      const sender = process.env.EMAIL_FROM || 'no-reply@diafitai.com';
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'DiaFit AI Healthcare', email: sender },
        to: [{ email: to }],
        subject,
        htmlContent: html
      }, {
        timeout: 4000,
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json'
        }
      });
      console.log('✓ [Email Service] Real email delivered successfully via Brevo API!');
      return true;
    } catch (error) {
      console.warn('⚠️ [Email Service] Brevo API delivery failed:', error.response?.data || error.message);
    }
  }

  // 3. Brevo SMTP Relay (if key starts with xsmtpsib- or BREVO_SMTP_KEY is provided)
  if (brevoKey && brevoKey.startsWith('xsmtpsib-')) {
    try {
      const brevoUser = (process.env.BREVO_USER || process.env.SMTP_USER || process.env.EMAIL_FROM || '').trim();
      if (brevoUser) {
        console.log(`[Email Service] Dispatching email to ${to} via Brevo SMTP Relay (smtp-relay.brevo.com:587)...`);
        const brevoTransporter = nodemailer.createTransport({
          host: 'smtp-relay.brevo.com',
          port: 587,
          secure: false,
          auth: {
            user: brevoUser,
            pass: brevoKey,
          },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
          tls: { rejectUnauthorized: false },
        });
        const info = await brevoTransporter.sendMail({
          from: `"DiaFit AI Healthcare" <${process.env.EMAIL_FROM || brevoUser}>`,
          to,
          subject,
          html,
          attachments,
        });
        console.log('✓ [Email Service] Email delivered successfully via Brevo SMTP Relay!', info.messageId);
        return true;
      }
    } catch (brevoErr) {
      console.warn('⚠️ [Email Service] Brevo SMTP Relay delivery failed:', brevoErr.message);
    }
  }

  // 4. Resend API if configured
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    try {
      console.log(`[Email Service] Dispatching email to ${to} via Resend HTTP API...`);
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
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✓ [Email Service] Email delivered successfully via Resend API!');
      return true;
    } catch (error) {
      console.warn('⚠️ [Email Service] Resend delivery failed:', error.response?.data || error.message);
    }
  }

  // 5. Ethereal Test Account Fallback (simulated delivery for offline/development)
  try {
    const ethTrans = await getEtherealTransporter();
    if (ethTrans) {
      console.log(`[Email Service] Dispatching email to ${to} via Ethereal fallback...`);
      const info = await ethTrans.sendMail({
        from: '"DiaFit AI Healthcare" <no-reply@diafit.com>',
        to,
        subject,
        html,
        attachments,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✓ [Email Service] Email captured by Ethereal SMTP test account! Preview:', previewUrl);
      // Return false to indicate that real external inbox delivery was not completed
      return false;
    }
  } catch (ethErr) {
    console.warn('⚠️ [Email Service] Ethereal fallback failed:', ethErr.message);
  }

  return false;
};

module.exports = { sendEmail };

