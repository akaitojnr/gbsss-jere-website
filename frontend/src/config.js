const baseUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
