const twilio = require('twilio');

// Emergency phone numbers
const EMERGENCY_NUMBERS = {
  INDIA: {
    AMBULANCE: '+91-102', // National emergency number for ambulance
    POLICE: '+91-100',    // National emergency number for police
    FIRE: '+91-101',      // National emergency number for fire
    CUSTOM: '+918447879309' // Your specified emergency number
  },
  US: {
    EMERGENCY: '911'
  }
};

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

function formatSOSMessage(user, location = 'Unknown location') {
  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  return `🚨 SOS ALERT 🚨

EMERGENCY: ${userName} has triggered an SOS alert!

📍 Location: ${location}
⏰ Time: ${timestamp}
📱 User ID: ${user._id}

This is an automated emergency alert. Please respond immediately.

- FamilySafe AI System`;

}

function formatEmergencyCallMessage(user, location = 'Unknown location') {
  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  return `🚨 EMERGENCY CALL ALERT 🚨

URGENT: ${userName} needs immediate medical assistance!

📍 Location: ${location}
⏰ Time: ${timestamp}
📱 User ID: ${user._id}

This is an automated emergency call request. Please dispatch ambulance immediately.

- FamilySafe AI System`;
}

async function sendSOSAlert(user, location = 'Unknown location') {
  const fromNumber = process.env.SMS_FROM_NUMBER;
  const message = formatSOSMessage(user, location);
  const emergencyNumber = EMERGENCY_NUMBERS.INDIA.CUSTOM; // Your specified number

  if (!client) {
    // Mock SOS alert for development
    console.log(`[MOCK SOS] Would send emergency alert to ${emergencyNumber}:`);
    console.log(message);
    console.log('--- End Mock SOS Alert ---');
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      messageId: `mock_sos_${Date.now()}`,
      to: emergencyNumber,
      status: 'sent',
      mock: true
    };
  }

  if (!fromNumber) {
    throw new Error('Missing SMS_FROM_NUMBER');
  }

  try {
    const result = await client.messages.create({
      to: emergencyNumber,
      from: fromNumber,
      body: message
    });

    console.log(`SOS alert sent successfully to ${emergencyNumber}. SID: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
      to: emergencyNumber,
      status: 'sent'
    };
  } catch (error) {
    console.error('Failed to send SOS alert:', error);
    throw new Error(`Failed to send SOS alert: ${error.message}`);
  }
}

async function initiateEmergencyCall(user, location = 'Unknown location') {
  const fromNumber = process.env.SMS_FROM_NUMBER;
  const ambulanceNumber = EMERGENCY_NUMBERS.INDIA.AMBULANCE;
  const message = formatEmergencyCallMessage(user, location);

  if (!client) {
    // Mock emergency call for development
    console.log(`[MOCK EMERGENCY CALL] Would call ambulance service at ${ambulanceNumber}:`);
    console.log(message);
    console.log('--- End Mock Emergency Call ---');
    
    // Simulate a longer delay for emergency call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      smsId: `mock_emergency_sms_${Date.now()}`,
      callId: `mock_emergency_call_${Date.now()}`,
      to: ambulanceNumber,
      status: 'sent',
      mock: true
    };
  }

  if (!fromNumber) {
    throw new Error('Missing SMS_FROM_NUMBER');
  }

  try {
    // First send SMS to ambulance service
    const smsResult = await client.messages.create({
      to: ambulanceNumber,
      from: fromNumber,
      body: message
    });

    // Then initiate a call (if Twilio phone number supports voice)
    let callResult = null;
    try {
      callResult = await client.calls.create({
        to: ambulanceNumber,
        from: fromNumber,
        twiml: `<Response>
          <Say voice="alice" language="en-IN">
            Emergency alert. ${user.firstName || 'User'} has triggered an SOS alert at ${location}. 
            This is an automated emergency call. Please respond immediately.
          </Say>
          <Pause length="2"/>
          <Say voice="alice" language="en-IN">
            Emergency alert. ${user.firstName || 'User'} has triggered an SOS alert at ${location}. 
            This is an automated emergency call. Please respond immediately.
          </Say>
        </Response>`
      });
    } catch (callError) {
      console.warn('Emergency call failed, SMS was sent:', callError.message);
    }

    console.log(`Emergency alert sent to ambulance service. SMS SID: ${smsResult.sid}`);
    return {
      success: true,
      smsId: smsResult.sid,
      callId: callResult?.sid,
      to: ambulanceNumber,
      status: 'sent'
    };
  } catch (error) {
    console.error('Failed to send emergency alert:', error);
    throw new Error(`Failed to send emergency alert: ${error.message}`);
  }
}

async function sendSOSToContacts(user, contacts, location = 'Unknown location') {
  const fromNumber = process.env.SMS_FROM_NUMBER;
  const message = formatSOSMessage(user, location);
  const results = [];

  if (!client) {
    // Mock SOS to contacts for development
    console.log(`[MOCK SOS TO CONTACTS] Would send to ${contacts.length} contacts:`);
    for (const contact of contacts) {
      if (contact.phone && contact.notificationPreferences?.sms?.enabled) {
        console.log(`  - ${contact.firstName} ${contact.lastName} (${contact.phone})`);
        results.push({
          contactId: contact._id,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          success: true,
          messageId: `mock_contact_${Date.now()}_${contact._id}`,
          status: 'sent',
          mock: true
        });
      }
    }
    console.log('--- End Mock SOS to Contacts ---');
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return results;
  }

  if (!fromNumber) {
    throw new Error('Missing SMS_FROM_NUMBER');
  }

  for (const contact of contacts) {
    if (contact.phone && contact.notificationPreferences?.sms?.enabled) {
      try {
        const result = await client.messages.create({
          to: contact.phone,
          from: fromNumber,
          body: message
        });

        results.push({
          contactId: contact._id,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          success: true,
          messageId: result.sid,
          status: 'sent'
        });

        console.log(`SOS alert sent to contact ${contact.firstName} ${contact.lastName} at ${contact.phone}`);
      } catch (error) {
        console.error(`Failed to send SOS to contact ${contact.firstName} ${contact.lastName}:`, error);
        results.push({
          contactId: contact._id,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          success: false,
          error: error.message,
          status: 'failed'
        });
      }
    }
  }

  return results;
}

module.exports = {
  sendSOSAlert,
  initiateEmergencyCall,
  sendSOSToContacts,
  EMERGENCY_NUMBERS,
  isConfigured: !!client
};
