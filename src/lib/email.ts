import emailjs from '@emailjs/browser';

type EmailJsConfig = {
  publicKey: string;
  serviceId: string;
  sosTemplateId: string;
};

const EMAILJS_CONFIG: EmailJsConfig = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'LVFVQxgdej6FT8-4o',
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_mzrkddf',
  sosTemplateId: import.meta.env.VITE_EMAILJS_SOS_TEMPLATE_ID || 'template_jb8yqjo',
};

let initialized = false;

export function ensureEmailJsInitialized(): void {
  if (initialized) return;
  emailjs.init(EMAILJS_CONFIG.publicKey);
  initialized = true;
}

export async function sendSosEmail(templateParams: Record<string, any> = {}): Promise<void> {
  ensureEmailJsInitialized();
  await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.sosTemplateId, templateParams);
}


