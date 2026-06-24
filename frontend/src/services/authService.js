import axios from 'axios';

const authService = {
  register: async (credentials) => {
    const res = await axios.post('/api/auth/register', credentials);
    return res.data;
  },
  login: async (credentials) => {
    const res = await axios.post('/api/auth/login', credentials);
    return res.data;
  },
  googleLogin: async (token) => {
    const res = await axios.post('/api/auth/google', { token });
    return res.data;
  },
  verifyOtp: async (otpData) => {
    const res = await axios.post('/api/auth/verify-otp', otpData);
    return res.data;
  },
  resendOtp: async (userId) => {
    const res = await axios.post('/api/auth/resend-otp', { userId });
    return res.data;
  },
  updateTheme: async (themeMode, token) => {
    const res = await axios.put('/api/profile/theme', { themeMode }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};

export default authService;