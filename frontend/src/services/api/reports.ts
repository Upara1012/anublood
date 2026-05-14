import api from './axios';

export const getDashboardStats = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data.data;
};

export const getMonthlyTrends = async () => {
  const response = await api.get('/reports/monthly');
  return response.data.data;
};

export const getExpiryStats = async () => {
  const response = await api.get('/reports/expiry');
  return response.data.data;
};
