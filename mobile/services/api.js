import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your deployed backend URL
const API_URL = 'https://optimeal-server.vercel.app';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
    login: (email, password, role) => api.post('/api/auth/login', { email, password, role }),
    studentRegister: (data) => api.post('/api/auth/register', data),
    managerRegister: (data) => api.post('/api/auth/manager/register', data),
};

// Attendance APIs
export const attendanceAPI = {
    get: (studentId, date) => api.get(`/api/attendance?studentId=${studentId}&date=${date}`),
    update: (data) => api.post('/api/attendance/update', data),
    getStats: (messId) => api.get(`/api/attendance/stats?messId=${messId}`),
};

// Menu APIs
export const menuAPI = {
    getDaily: (messId, date) => api.get(`/api/menu/daily?messId=${messId}&date=${date}`),
    getWeekly: (messId) => api.get(`/api/menu/weekly?messId=${messId}`),
    update: (data) => api.post('/api/menu', data),
};

// Mess APIs
export const messAPI = {
    getTimings: (messId) => api.get(`/api/mess/timings?messId=${messId}`),
    updateTimings: (data) => api.post('/api/mess/timings', data),
    canRequest: (messId, meal) => api.get(`/api/mess/can-request?messId=${messId}&meal=${meal}`),
};

// Feedback API
export const feedbackAPI = {
    submit: (data) => api.post('/api/feedback', data),
};

// Student Management APIs
export const studentAPI = {
    getPending: (messId) => api.get(`/api/auth/pending-students?messId=${messId}`),
    verify: (studentId) => api.post('/api/auth/verify-student', { studentId }),
    reject: (studentId) => api.delete(`/api/auth/delete-student?studentId=${studentId}`),
    getAll: (messId) => api.get(`/api/students?messId=${messId}`),
};

export default api;
