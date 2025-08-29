const twilio = require('twilio');

function createClient() {
  const service = (process.env.SMS_SERVICE || '').toLowerCase();
  if (service !== 'twilio') {
    return null;
  }
  const accountSid = process.env.SMS_ACCOUNT_SID;
  const authToken = process.env.SMS_AUTH_TOKEN;
  if (!accountSid || !authToken || accountSid === 'your-twilio-account-sid') {
    return null;
  }
  try {
    return twilio(accountSid, authToken);
  } catch (e) {
    return null;
  }
}

const client = createClient();

function formatAlertMessage(alert) {
  const severity = alert.severity.toUpperCase();
  const location = alert.location || 'Unknown location';
  const timestamp = new Date(alert.timestamp).toLocaleString();
  
  return `🚨 ${severity} ALERT 🚨

${alert.title}

📍 Location: ${location}
⏰ Time: ${timestamp}
📝 Description: ${alert.description}

This is an automated alert from FamilySafe AI.
Please respond immediately if needed.

- FamilySafe AI System`;
}

async function sendAlertSMS(to, alert) {
  if (!client) {
    // Mock SMS sending for development
    console.log(`[MOCK SMS] Would send to ${to}:`);
    console.log(formatAlertMessage(alert));
    console.log('--- End Mock SMS ---');
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      status: 'sent',
      mock: true
    };
  }

  const fromNumber = process.env.SMS_FROM_NUMBER;
  if (!fromNumber) {
    throw new Error('Missing SMS_FROM_NUMBER');
  }

  const message = formatAlertMessage(alert);

  try {
    const result = await client.messages.create({
      to: to,
      from: fromNumber,
      body: message
    });

    console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
      status: 'sent'
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

async function sendSMS(to, message) {
  if (!client) {
    // Mock SMS sending for development
    console.log(`[MOCK SMS] Would send to ${to}:`);
    console.log(message);
    console.log('--- End Mock SMS ---');
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      status: 'sent',
      mock: true
    };
  }

  const fromNumber = process.env.SMS_FROM_NUMBER;
  if (!fromNumber) {
    throw new Error('Missing SMS_FROM_NUMBER');
  }

  try {
    const result = await client.messages.create({
      to: to,
      from: fromNumber,
      body: message
    });

    console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
      status: 'sent'
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

module.exports = {
  sendAlertSMS,
  sendSMS,
  isConfigured: !!client
};


