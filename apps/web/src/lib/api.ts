import axios, { AxiosInstance, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthResponse {
  user: Record<string, unknown>;
  organization: Record<string, unknown>;
  accessToken: string;
  refreshToken: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${BASE_URL}/api/v1`,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
              localStorage.setItem('accessToken', data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  auth = {
    login: (email: string, password: string) =>
      this.client.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
    register: (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      organizationName: string;
    }) => this.client.post<AuthResponse>('/auth/register', data).then((r) => r.data),
    logout: () => this.client.post('/auth/logout').then((r) => r.data),
    me: () => this.client.get('/auth/me').then((r) => r.data),
  };

  leads = {
    list: (params?: Record<string, unknown>) =>
      this.client.get<PaginatedResponse<Record<string, unknown>>>('/leads', { params }).then((r) => r.data),
    get: (id: string) => this.client.get(`/leads/${id}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/leads', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/leads/${id}`, data).then((r) => r.data),
    delete: (id: string) => this.client.delete(`/leads/${id}`).then((r) => r.data),
    nearby: (lat: number, lng: number, radius: number) =>
      this.client.get('/leads/nearby', { params: { lat, lng, radius } }).then((r) => r.data),
    stats: () => this.client.get('/leads/stats').then((r) => r.data),
    bulkAssign: (leadIds: string[], repId: string) =>
      this.client.post('/leads/bulk-assign', { leadIds, repId }).then((r) => r.data),
    import: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.client.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
  };

  territories = {
    list: () => this.client.get('/territories').then((r) => r.data),
    get: (id: string) => this.client.get(`/territories/${id}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/territories', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/territories/${id}`, data).then((r) => r.data),
    delete: (id: string) => this.client.delete(`/territories/${id}`).then((r) => r.data),
    assign: (id: string, repIds: string[]) =>
      this.client.post(`/territories/${id}/assign`, { repIds }).then((r) => r.data),
  };

  activities = {
    list: (params?: Record<string, unknown>) =>
      this.client.get('/activities', { params }).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/activities', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/activities/${id}`, data).then((r) => r.data),
    delete: (id: string) => this.client.delete(`/activities/${id}`).then((r) => r.data),
    trackLocation: (lat: number, lng: number) =>
      this.client.post('/activities/location', { lat, lng }).then((r) => r.data),
  };

  analytics = {
    dashboard: (params?: Record<string, unknown>) =>
      this.client.get('/analytics/dashboard', { params }).then((r) => r.data),
    territories: () => this.client.get('/analytics/territories').then((r) => r.data),
    reps: () => this.client.get('/analytics/reps').then((r) => r.data),
    funnel: () => this.client.get('/analytics/funnel').then((r) => r.data),
  };

  enrichment = {
    enrichLead: (leadId: string) =>
      this.client.post(`/enrichment/leads/${leadId}`).then((r) => r.data),
    scoreLead: (leadId: string) =>
      this.client.post(`/enrichment/leads/${leadId}/score`).then((r) => r.data),
    scoreAll: () => this.client.post('/enrichment/score-all').then((r) => r.data),
    queue: () => this.client.get('/enrichment/queue').then((r) => r.data),
  };

  users = {
    list: () => this.client.get('/users').then((r) => r.data),
    get: (id: string) => this.client.get(`/users/${id}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/users', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/users/${id}`, data).then((r) => r.data),
    repLocations: () => this.client.get('/users/rep-locations').then((r) => r.data),
  };

  companies = {
    list: (params?: Record<string, unknown>) =>
      this.client.get('/companies', { params }).then((r) => r.data),
    get: (id: string) => this.client.get(`/companies/${id}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/companies', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/companies/${id}`, data).then((r) => r.data),
  };

  contacts = {
    list: (params?: Record<string, unknown>) =>
      this.client.get('/contacts', { params }).then((r) => r.data),
    create: (data: Record<string, unknown>) => this.client.post('/contacts', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.patch(`/contacts/${id}`, data).then((r) => r.data),
  };
}

export const api = new ApiClient();
export default api;
