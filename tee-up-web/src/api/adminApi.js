import axiosInstance from './axiosInstance';

// Admin Authentication
export const adminLogin = async (email, password) => {
  const response = await axiosInstance.post('/admin/login', {
    email,
    password,
  });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await axiosInstance.get('/admin/profile');
  return response.data;
};

// Admin Management (Superadmin only)
export const createAdmin = async (adminData) => {
  const response = await axiosInstance.post('/admin/create', adminData);
  return response.data;
};

export const getAllAdmins = async () => {
  const response = await axiosInstance.get('/admin/all');
  return response.data;
};

export const updateAdminRole = async (userId, role) => {
  const response = await axiosInstance.put(`/admin/${userId}/role`, { role });
  return response.data;
};

