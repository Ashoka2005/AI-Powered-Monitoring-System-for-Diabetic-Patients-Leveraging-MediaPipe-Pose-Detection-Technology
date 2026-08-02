const axios = require('axios');

const sendSMS = async ({ to, body }) => {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log('=== [SIMULATED SMS DISPATCHED] ===');
      console.log(`To: ${to}`);
      console.log(`Body: ${body}`);
      console.log('==================================');
      return { success: true, simulated: true };
    }

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const data = new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: to,
      Body: body
    });

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      data.toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log(`Real SMS dispatched via Twilio to ${to}. Message SID: ${response.data.sid}`);
    return { success: true, sid: response.data.sid };
  } catch (error) {
    console.error('SMS sending error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
