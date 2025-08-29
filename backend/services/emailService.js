const nodemailer = require('nodemailer');

function createTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || String(smtpPort) === '465';

  const emailService = (process.env.EMAIL_SERVICE || '').toLowerCase();
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Prefer explicit SMTP if host is provided (port optional -> default 587)
  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });
  }

  // Common service-based path (e.g., Gmail)
  if (emailService && emailUser && emailPass) {
    return nodemailer.createTransport({
      service: emailService, // e.g., 'gmail'
      auth: { user: emailUser, pass: emailPass }
    });
  }

  // Nothing configured -> return null (handled in sendEmail)
  return null;
}

const transporter = createTransport();

/**
 * Resolve a safe "from" address.
 * For Gmail, the "from" must be the authenticated account (EMAIL_USER), otherwise Gmail drops/rewrites it.
 */
function resolveFromAddress() {
  const svc = (process.env.EMAIL_SERVICE || '').toLowerCase();
  const user = process.env.EMAIL_USER;
  const configuredFrom = process.env.EMAIL_FROM;

  if (svc === 'gmail') {
    // Gmail: stick to the authenticated user to avoid silent rejection
    return user;
  }
  // For SMTP/other providers, allow EMAIL_FROM fallback to EMAIL_USER
  return configuredFrom || user;
}

/**
 * Sends an email and throws on misconfiguration in all environments.
 * This avoids "success: true" when nothing actually went out.
 */
async function sendEmail({ to, subject, text, html }) {
  if (!process.env.ENABLE_EMAIL_NOTIFICATIONS || process.env.ENABLE_EMAIL_NOTIFICATIONS === 'false') {
    throw new Error('Email notifications are disabled (ENABLE_EMAIL_NOTIFICATIONS=false).');
  }

  if (!transporter) {
    throw new Error(
      'Email transport not configured. Set either SMTP_HOST (+ SMTP_USER/SMTP_PASS) or EMAIL_SERVICE/EMAIL_USER/EMAIL_PASS.'
    );
  }

  const from = resolveFromAddress();
  if (!from) {
    throw new Error('No valid FROM address. Set EMAIL_USER or EMAIL_FROM.');
  }

  const toList = Array.isArray(to)
    ? to
    : String(to || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  if (toList.length === 0) {
    throw new Error('No recipients provided. Set ALERT_EMAIL_TO in your .env.');
  }

  const info = await transporter.sendMail({
    from,
    to: toList.join(', '),
    subject,
    text,
    html
  });

  return { success: true, messageId: info.messageId, accepted: info.accepted || [], rejected: info.rejected || [] };
}

function buildAlertEmail(alert, user) {
  const subject = `FamilySafe Alert: ${alert.title} (${String(alert.severity || '').toUpperCase()})`;
  const when = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : new Date().toLocaleString();
  const text = `Alert Type: ${alert.alertType}
Severity: ${alert.severity}
Title: ${alert.title}
Description: ${alert.description}
Location: ${alert.location || 'Unknown'}
Time: ${when}
User: ${(user?.firstName || '')} ${(user?.lastName || '')}`;

  const html = `
    <h2>FamilySafe Alert</h2>
    <p><strong>Type:</strong> ${alert.alertType}</p>
    <p><strong>Severity:</strong> ${String(alert.severity || '').toUpperCase()}</p>
    <p><strong>Title:</strong> ${alert.title}</p>
    <p><strong>Description:</strong> ${alert.description}</p>
    <p><strong>Location:</strong> ${alert.location || 'Unknown'}</p>
    <p><strong>Time:</strong> ${when}</p>
    <p><strong>User:</strong> ${(user?.firstName || '')} ${(user?.lastName || '')}</p>
  `;
  return { subject, text, html };
}

module.exports = { sendEmail, buildAlertEmail };
