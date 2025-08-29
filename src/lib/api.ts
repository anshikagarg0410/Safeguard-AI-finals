export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE = 'http://localhost:5000/api';

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err?.error?.message || err?.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const AuthAPI = {
  async register(payload: { firstName: string; lastName: string; email: string; password: string; phone?: string; }): Promise<{ success: boolean; data: { user: any; token: string } }> {
    return apiRequest('/auth/register', 'POST', payload);
  },
  async login(payload: { email: string; password: string }): Promise<{ success: boolean; data: { user: any; token: string } }> {
    return apiRequest('/auth/login', 'POST', payload);
  },
  async me(): Promise<{ success: boolean; data: { user: any } }> {
    return apiRequest('/auth/me', 'GET');
  },
};

export const ContactAPI = {
  async getContacts(): Promise<{ success: boolean; data: { contacts: any[] } }> {
    return apiRequest('/contacts', 'GET');
  },
  async createContact(payload: {
    contactType: string;
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phone: string;
    isPrimary?: boolean;
  }): Promise<{ success: boolean; data: { contact: any } }> {
    return apiRequest('/contacts', 'POST', payload);
  },
  async updateContact(id: string, payload: any): Promise<{ success: boolean; data: { contact: any } }> {
    return apiRequest(`/contacts/${id}`, 'PUT', payload);
  },
  async deleteContact(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/contacts/${id}`, 'DELETE');
  },
};

export const AlertAPI = {
  async getAlerts(): Promise<{ success: boolean; data: { alerts: any[] } }> {
    return apiRequest('/alerts', 'GET');
  },
  async sendWatchTest(): Promise<{ success: boolean; result?: any }> {
    return apiRequest('/alerts/push-test', 'POST');
  },
  async triggerSOS(payload: {
    location?: string;
    includeEmergencyCall?: boolean;
  }): Promise<{ success: boolean; data: { alert: any; sosResult: any; emergencyCallResult: any; contactResults: any[] } }> {
    return apiRequest('/alerts/sos', 'POST', payload);
  },
  async triggerEmergencyCall(payload: {
    location?: string;
  }): Promise<{ success: boolean; data: { alert: any; emergencyCallResult: any; contactResults: any[] } }> {
    return apiRequest('/alerts/emergency-call', 'POST', payload);
  },
};


