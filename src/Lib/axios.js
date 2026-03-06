import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://chatapp-raff.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
instance.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => Promise.reject(error));

// Response Interceptor: Handle 401 & Refresh Token
instance.interceptors.response.use(response => response, async error => {
  if (error.response && error.response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.error('No refresh token available');
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        'https://chatapp-raff.onrender.com/api/auth/refresh',
        { refreshToken },
        { withCredentials: true }
      );

      // Store new access token
      localStorage.setItem('accessToken', data.accessToken);

      // Retry the original request with the new token
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return axios(error.config);
    } catch (refreshError) {
      console.error('Error refreshing token', refreshError);
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});

export default instance;
