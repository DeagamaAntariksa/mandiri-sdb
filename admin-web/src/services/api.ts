import axios from 'axios';
import toast from 'react-hot-toast';

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('--- API Error Debug ---');
        console.error('Message:', error.message);
        console.error('Config URL:', error.config?.url);
        console.error('Base URL:', error.config?.baseURL);

        if (error.code === 'ERR_NETWORK') {
            toast.error('Gagal terhubung ke Server (Network Error). Pastikan Backend di port 5001 sudah jalan.');
        } else {
            const message = error.response?.data?.message || error.message || 'Something went wrong';
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;
