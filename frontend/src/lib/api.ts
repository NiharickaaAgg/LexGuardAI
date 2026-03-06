import axios from 'axios';

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('lexguard_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
    API.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
    API.post('/auth/login', data);

export const logout = () => API.post('/auth/logout');

export const getMe = () => API.get('/auth/me');

// Documents
export const uploadDocument = (formData: FormData) =>
    API.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Audits
export const getAudits = (page = 1) =>
    API.get(`/api/audits?page=${page}&limit=10`);

export const getAudit = (id: string) =>
    API.get(`/api/audits/${id}`);

export default API;