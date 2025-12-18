import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/signin', { email, password }),
    signup: (data) => api.post('/auth/signup', data),
};

// User API
export const userAPI = {
    getAllUsers: () => api.get('/users'),
    getUsersByRole: (role) => api.get(`/users/role/${role}`),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    verifyTherapist: (id) => api.put(`/users/${id}/verify`),
    toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// Appointment API
export const appointmentAPI = {
    create: (clientId, therapistId, appointmentTime) =>
        api.post('/appointments', null, { params: { clientId, therapistId, appointmentTime } }),
    updateStatus: (id, status) =>
        api.put(`/appointments/${id}/status`, null, { params: { status } }),
    getClientAppointments: (clientId) => api.get(`/appointments/client/${clientId}`),
    getTherapistAppointments: (therapistId) => api.get(`/appointments/therapist/${therapistId}`),
};

// Session API
export const sessionAPI = {
    create: (appointmentId, notes, summary, progressScore) =>
        api.post('/sessions', null, { params: { appointmentId, notes, summary, progressScore } }),
    update: (id, notes, summary, progressScore) =>
        api.put(`/sessions/${id}`, null, { params: { notes, summary, progressScore } }),
    getClientSessions: (clientId) => api.get(`/sessions/client/${clientId}`),
    getTherapistSessions: (therapistId) => api.get(`/sessions/therapist/${therapistId}`),
};

// Goal API
export const goalAPI = {
    create: (clientId, therapistId, description, startDate, targetDate) =>
        api.post('/goals', null, { params: { clientId, therapistId, description, startDate, targetDate } }),
    updateStatus: (id, status) =>
        api.put(`/goals/${id}/status`, null, { params: { status } }),
    getClientGoals: (clientId) => api.get(`/goals/client/${clientId}`),
};

// Task API
export const taskAPI = {
    create: (clientId, therapistId, goalId, title, instructions, dueDate) =>
        api.post('/tasks', null, { params: { clientId, therapistId, goalId, title, instructions, dueDate } }),
    markCompleted: (id) => api.put(`/tasks/${id}/complete`),
    getClientTasks: (clientId) => api.get(`/tasks/client/${clientId}`),
    getGoalTasks: (goalId) => api.get(`/tasks/goal/${goalId}`),
};

// Message API
export const messageAPI = {
    send: (senderId, receiverId, content, type = 'TEXT') =>
        api.post('/messages', null, { params: { senderId, receiverId, content, type } }),
    getConversation: (user1Id, user2Id) =>
        api.get('/messages/conversation', { params: { user1Id, user2Id } }),
    getUnreadMessages: (userId) => api.get(`/messages/unread/${userId}`),
    markAsRead: (id) => api.put(`/messages/${id}/read`),
};

// Notification API
export const notificationAPI = {
    getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
    getUnreadNotifications: (userId) => api.get(`/notifications/user/${userId}/unread`),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// Resource API
export const resourceAPI = {
    create: (formData) =>
        api.post('/resources', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    getTherapistResources: (therapistId) => api.get(`/resources/therapist/${therapistId}`),
    getClientResources: (clientId) => api.get(`/resources/client/${clientId}`),
    deleteResource: (id) => api.delete(`/resources/${id}`),
};

// Payment API
export const paymentAPI = {
    create: (clientId, sessionId, amount, currency, transactionId) =>
        api.post('/payments', null, { params: { clientId, sessionId, amount, currency, transactionId } }),
    updateStatus: (id, status) => api.put(`/payments/${id}/status`, null, { params: { status } }),
    getClientPayments: (clientId) => api.get(`/payments/client/${clientId}`),
    getTherapistPayments: (therapistId) => api.get(`/payments/therapist/${therapistId}`),
};

export default api;
