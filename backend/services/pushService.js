const fetchFn = global.fetch
  ? global.fetch.bind(global)
  : (url, options) => import('node-fetch').then(({ default: f }) => f(url, options));

function isConfigured() {
  return Boolean(process.env.PUSHOVER_USER_KEY && process.env.PUSHOVER_API_TOKEN);
}

async function sendPush({ title, message, url, priority = 0 }) {
  if (!isConfigured()) {
    console.log('[MOCK PUSH]', { title, message, url, priority });
    return { success: true, mock: true };
  }

  const body = new URLSearchParams();
  body.set('token', process.env.PUSHOVER_API_TOKEN);
  body.set('user', process.env.PUSHOVER_USER_KEY);
  body.set('title', title || 'FamilySafe');
  body.set('message', message);
  if (url) body.set('url', url);
  if (priority !== undefined) body.set('priority', String(priority));

  const res = await fetchFn('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pushover error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { success: true, request: data.request };
}

function buildAlertPush(alert) {
  const title = `Alert: ${alert.title}`;
  const message = `${alert.alertType} | ${alert.severity.toUpperCase()}\n${alert.description || ''}\nLocation: ${alert.location || 'Unknown'}\nTime: ${new Date(alert.timestamp).toLocaleString()}`;
  return { title, message };
}

function buildSosPush(location) {
  const title = 'SOS Triggered';
  const message = `SOS alert has been triggered. Location: ${location || 'Unknown'}`;
  return { title, message, priority: 1 };
}

module.exports = { sendPush, buildAlertPush, buildSosPush };


