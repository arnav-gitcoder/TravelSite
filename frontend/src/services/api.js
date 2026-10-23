import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const getAdminToken = () => {
  try { return localStorage.getItem('adminToken'); }
  catch { return null; }
};

const getUserToken = () => { try { return localStorage.getItem('userToken'); } catch { return null; } };

apiClient.interceptors.request.use((config) => {
  const token = getAdminToken() || getUserToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler — log but don't swallow
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data?.message || err.message);
    return Promise.reject(err);
  }
);


// ── User Auth ────────────────────────────────────
export const registerUser = (data) => apiClient.post('/users/register', data);
export const verifyUserOTP = (data) => apiClient.post('/users/verify-otp', data);
export const resendUserOTP = (data) => apiClient.post('/users/resend-otp', data);
export const loginUser = (data) => apiClient.post('/users/login', data);
export const getUserMe = () => apiClient.get('/users/me');
export const forgotPassword = (data) => apiClient.post('/users/forgot-password', data);
export const resetPassword = (data) => apiClient.post('/users/reset-password', data);

// ── Packages ──────────────────────────────────────────────
export const getPackages = (params = {}) => apiClient.get('/packages', { params });
export const getAllPackages = (params = {}) => apiClient.get('/packages', { params });
export const getPackageById = (id) => apiClient.get(`/packages/${id}`);
export const getFeaturedPackages = () => apiClient.get('/packages/featured');
export const getPackagesByCategory = (category) => apiClient.get(`/packages/category/${category}`);
export const createPackage = (data) => apiClient.post('/packages', data);
export const createPackageWithImages = (formData) => apiClient.post('/packages', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePackageWithImages = (id, formData) => apiClient.put(`/packages/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePackage = (id, data) => apiClient.put(`/packages/${id}`, data);
export const deletePackage = (id) => apiClient.delete(`/packages/${id}`);

// ── Bookings ──────────────────────────────────────────────
export const createBooking = (data) => apiClient.post('/bookings', data);
export const getBooking = (id) => apiClient.get(`/bookings/${id}`);
export const getAllBookings = (params = {}) => apiClient.get('/bookings', { params });
export const updateBookingStatus = (id, status) => apiClient.put(`/bookings/${id}`, { status });
export const getBookingStats = () => apiClient.get('/bookings/stats');

// ── Custom Packages ───────────────────────────────────────
export const createCustomPackage = (data) => apiClient.post('/custom-packages', data);
export const getCustomPackage = (id) => apiClient.get(`/custom-packages/${id}`);
export const getAllCustomPackages = (params = {}) => apiClient.get('/custom-packages', { params });
export const updateCustomPackage = (id, data) => apiClient.put(`/custom-packages/${id}`, data);
export const submitCustomPackage = (id) => apiClient.post(`/custom-packages/${id}/submit`);
export const deleteCustomPackage = (id) => apiClient.delete(`/custom-packages/${id}`);
export const updateCustomPackageStatus = (id, status) => apiClient.patch(`/custom-packages/${id}/status`, { status });

// ── Admin ─────────────────────────────────────────────────
export const registerAdmin = (data) => apiClient.post('/admin/register', data);
export const loginAdmin = (data) => apiClient.post('/admin/login', data);
export const forgotAdminPassword = (data) => apiClient.post('/admin/forgot-password', data);
export const resetAdminPassword = (data) => apiClient.post('/admin/reset-password', data);
export const verifyAdminToken = () => apiClient.get('/admin/verify');
export const getDashboardStats = () => apiClient.get('/admin/dashboard');

// ── Contact ───────────────────────────────────────────────
export const submitContact = (data) => apiClient.post('/contact', data);

// ── Destinations ──────────────────────────────────────────
export const getAllDestinations = (params = {}) => apiClient.get('/destinations', { params });
export const getDestinationById = (id) => apiClient.get(`/destinations/${id}`);
export const getDestinationsByCategory = (category) =>
  apiClient.get(`/destinations/category/${category}`);
export const createDestination = (data) => apiClient.post('/destinations', data);
export const createDestinationWithImage = (formData) => apiClient.post('/destinations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDestinationWithImage = (id, formData) => apiClient.put(`/destinations/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDestination = (id, data) => apiClient.put(`/destinations/${id}`, data);
export const deleteDestination = (id) => apiClient.delete(`/destinations/${id}`);

// ── Trip Themes ───────────────────────────────────────────
export const getAllTripThemes = () => apiClient.get('/trip-themes');
export const getTripThemeById = (id) => apiClient.get(`/trip-themes/${id}`);

// ── Health ────────────────────────────────────────────────
export const checkHealth = () => apiClient.get('/health');

export default apiClient;
