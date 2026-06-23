//api.ts
// API service for communicating with Flask backend
console.log("hostname =", window.location.hostname);
console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

console.log("API_BASE =", API_BASE);

// Get token from localStorage
const getAuthToken = () => localStorage.getItem('token');

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }; 

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { registration_code: string; username: string; email: string; full_name: string; password: string; floor: string; room: string }) =>
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (emailOrUsername: string, password: string) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email: emailOrUsername, password }) }),
  getCurrentUser: () => apiCall('/auth/me'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (id: number) => apiCall(`/users/${id}`),
  search: (query: string) => apiCall(`/users/search?q=${encodeURIComponent(query)}`),
  update: (id: number, data: any) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// ─── Robots ────────────────────────────────────────────────────────────────────
export const robotsAPI = {
  getAll: () => apiCall('/robots'),
  getById: (id: number) => apiCall(`/robots/${id}`),
  create: (data: any) => apiCall('/robots', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/robots/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Deliveries ────────────────────────────────────────────────────────────────
export const deliveriesAPI = {
  createRequest: (data: {
    document_name: string;
    sender: string;
    recipient: string;
    pickup_location: string;
    dropoff_location: string;
    recipient_user_id: number;
    quantity?: number;
    notes?: string;
  }) => apiCall('/deliveries/request', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => apiCall('/deliveries/my-requests'),
  getMyInbox: () => apiCall('/deliveries/my-inbox'),
  getById: (id: number) => apiCall(`/deliveries/${id}`),
  confirmReceived: (deliveryId: number) => apiCall(`/deliveries/${deliveryId}/received`, { method: 'PUT', body: JSON.stringify({}) }),
  getAllDeliveries: () => apiCall('/deliveries/admin/all'), // Admin endpoint
  updateDelivery: (deliveryId: number, data: any) => apiCall(`/deliveries/admin/${deliveryId}`, { method: 'PUT', body: JSON.stringify(data) }), // Admin endpoint
  deleteDelivery: (deliveryId: number) => apiCall(`/deliveries/admin/${deliveryId}`, { method: 'DELETE' }), // Admin endpoint
};

// ─── Telemetry ────────────────────────────────────────────────────────────────
export const telemetryAPI = {
  getAll: () => apiCall('/telemetry'),
  getByRobotId: (robotId: number) => apiCall(`/telemetry/robot/${robotId}`),
};

// ─── Alerts ────────────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll: () => apiCall('/alerts'),
  getActive: () => apiCall('/alerts/active'),
};