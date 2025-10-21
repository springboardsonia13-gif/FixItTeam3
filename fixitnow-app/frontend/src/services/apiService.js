import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Fix: was 'token', should be 'accessToken'
    console.log('API Request interceptor - Token exists:', !!token);
    console.log('API Request URL:', config.url);
    console.log('API Request Method:', config.method);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => {
    // console.log('API Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response error:', error.response?.status, error.config?.url);
    
    // Log network errors specifically
    if (!error.response) {
      console.error('Network Error - No response received:', {
        message: error.message,
        code: error.code
      });
    }
    
    if (error.response?.status === 401) {
      console.warn('Authentication expired, clearing stored tokens');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Clear any old token formats
      
      // Don't redirect to login for public endpoints
      const isPublicEndpoint = error.config?.url?.includes('/services') && 
                              !error.config?.url?.includes('/my-services');
      
      if (!isPublicEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Authentication
  login: (credentials) => apiClient.post('/auth/signin', credentials),
  register: (userData) => apiClient.post('/auth/signup', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
  debugCurrentUser: () => apiClient.get('/auth/me'),

  // Services
  getAllServices: (params) => apiClient.get('/services', { params }),
  getServices: (params) => apiClient.get('/services', { params }), // Alias for getAllServices
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  createService: (serviceData) => apiClient.post('/services', serviceData),
  updateService: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
  deleteService: (id) => apiClient.delete(`/services/${id}`),
  getProviderServices: () => apiClient.get(`/services/my-services`),
  updateServiceStatus: (id, isActive) => {
    console.log(`API: Updating service ${id} status to ${isActive} (type: ${typeof isActive})`);
    const requestData = { active: Boolean(isActive) }; // Ensure boolean type
    console.log('API: Request data:', requestData);
    return apiClient.patch(`/services/${id}/status`, requestData);
  },
  searchServices: (query, filters) => apiClient.get('/services/search', { params: { query, ...filters } }),

  // Bookings
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  getCustomerBookings: (customerId, limit) => apiClient.get(`/bookings/customer/${customerId}`, { params: { limit } }),
  getProviderBookings: (limit) => apiClient.get(`/bookings/my-bookings`, { params: { limit } }),
  getDashboardStats: () => apiClient.get(`/bookings/dashboard-stats`),
  updateBookingStatus: (id, status) => apiClient.put(`/bookings/${id}/status?status=${status}`),
  getBookingHistory: (userId, role) => apiClient.get(`/bookings/history/${userId}`, { params: { role } }),

  // Reviews
  createReview: (reviewData) => apiClient.post('/reviews', reviewData),
  getServiceReviews: (serviceId) => apiClient.get(`/reviews/service/${serviceId}`),
  getProviderReviews: (providerId) => apiClient.get(`/reviews/provider/${providerId}`),
  getProviderReviewStats: (providerId) => apiClient.get(`/reviews/provider/${providerId}/stats`),
  getCustomerReviews: (customerId) => apiClient.get(`/reviews/customer/${customerId}`),
  getBookingReview: (bookingId) => apiClient.get(`/reviews/booking/${bookingId}`),
  updateReview: (id, reviewData) => apiClient.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),

  // Users
  getUserProfile: (id) => apiClient.get(`/users/${id}`),
  updateUserProfile: (id, userData) => apiClient.put(`/users/${id}`, userData),
  getUsersByRole: (role) => apiClient.get(`/users/role/${role}`),
  verifyProvider: (id) => apiClient.patch(`/users/${id}/verify`),

  // Stats and Analytics
  getCustomerStats: (customerId) => apiClient.get(`/bookings/dashboard-stats`),
  getProviderStats: (providerId) => apiClient.get(`/bookings/dashboard-stats`),
  getAdminStats: () => apiClient.get('/stats/admin'),

  // Messages/Chat
  getConversations: (userId) => apiClient.get(`/messages/conversations/${userId}`),
  getMessages: (conversationId) => apiClient.get(`/messages/conversation/${conversationId}`),
  sendMessage: (messageData) => apiClient.post('/messages', messageData),
  
  // New Chat API endpoints
  getChatRooms: (userId) => apiClient.get(`/chat/rooms/${userId}`),
  getRoomMessages: (roomId) => apiClient.get(`/chat/room/${roomId}/messages`),
  createChatRoom: (data) => apiClient.post('/chat/room', data),
  markAsRead: (roomId, userId) => apiClient.post(`/chat/room/${roomId}/mark-read`, { userId }),
  getUnreadCount: (roomId, userId) => apiClient.get(`/chat/room/${roomId}/unread-count/${userId}`),

  // Categories
  getCategories: () => apiClient.get('/categories'),
  getSubcategories: (categoryId) => apiClient.get(`/categories/${categoryId}/subcategories`),

  // File Upload
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Notifications
  getNotifications: (userId) => apiClient.get(`/notifications/${userId}`),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  // Reports (Admin)
  getSystemReports: () => apiClient.get('/admin/reports'),
  getUserReports: () => apiClient.get('/admin/reports/users'),
  getBookingReports: () => apiClient.get('/admin/reports/bookings'),
  getRevenueReports: () => apiClient.get('/admin/reports/revenue'),

  // Map-related Services
  getServicesForMap: () => apiClient.get('/services/map'),
  getServicesInBounds: (bounds) => apiClient.get('/services/map/bounds', { 
    params: {
      minLat: bounds.minLat,
      maxLat: bounds.maxLat,
      minLng: bounds.minLng,
      maxLng: bounds.maxLng
    }
  }),
  getNearbyServices: (lat, lng, radiusKm = 10) => apiClient.get('/services/map/nearby', {
    params: { lat, lng, radiusKm }
  }),
  getDistinctCategories: () => apiClient.get('/services/categories'),
  getDistinctSubcategories: (category) => apiClient.get('/services/subcategories', {
    params: { category }
  }),
  updateServiceLocation: (serviceId, locationData) =>
    apiClient.patch(`/services/${serviceId}/location`, locationData),
};

export default apiService;