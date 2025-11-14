// Default to the production Railway URL, but allow override with VITE_API_URL
const API_BASE_URL = 'https://cozinhe-comigo-api-production-c7a5.up.railway.app/CozinheComigoAPI';

class ApiError extends Error {
  constructor(public status: number, message: string, public body?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async request(endpoint: string, options: RequestInit = {}, retryOnAuthFailure: boolean = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(url);
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'requesterUserToken': token }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let body: any = undefined;
      try {
        body = await response.clone().json();
      } catch {
        try {
          body = await response.clone().text();
        } catch {
          body = undefined;
        }
      }

      const message = body?.message || body?.returnMessage || body?.ReturnMessage || `HTTP error! status: ${response.status}`;

      // If backend says token is invalid/expired, remove it and retry once without auth
      const errMsg = String(message ?? '').toLowerCase();
      if (retryOnAuthFailure && (errMsg.includes('invalid or expired authentication token') || errMsg.includes('invalid or expired authentication'))) {
        localStorage.removeItem('token');
        // retry without token header
        const newHeaders: any = { ...config.headers };
        if (newHeaders['requesterUserToken']) delete newHeaders['requesterUserToken'];
        if (newHeaders['RequesterUserToken']) delete newHeaders['RequesterUserToken'];

        return this.request(endpoint, { ...options, headers: newHeaders }, false);
      }

      throw new ApiError(response.status, message, body);
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};