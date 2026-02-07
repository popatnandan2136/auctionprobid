import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include the auth token in headers
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setToken = (token) => {
    if (token) {
        API.defaults.headers.common['x-auth-token'] = token;
        // Also ensure it is in session storage to match usage
        sessionStorage.setItem('token', token);
    } else {
        delete API.defaults.headers.common['x-auth-token'];
        sessionStorage.removeItem('token');
    }
};

export default API;
