import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach Authorization header if a token is present
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

export const createTask = (data) => API.post('/tasks', data);
export const getTasks = () => API.get('/tasks');
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getStatistics = () => API.get('/tasks/stats');
