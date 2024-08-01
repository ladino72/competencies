import axios from 'axios';

const updateToken = (newToken) => {
  localStorage.setItem('token', newToken);
};

//const refreshTokenApi = axios.create(); // New Axios instance for token 
const api = axios.create(); // New Axios instance for token refresh


api.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    // Check for 401 status and specific 'Token has expired' message
    if (error.response && error.response.status === 401 && error.response.data.message === 'Token has expired' && !error.config._isRetry) {
      error.config._isRetry = true; // Prevent infinite retry loop
      try {
        const expiredToken = error.response.config.headers.Authorization.split(' ')[1];
        const response = await api.post(
          'http://localhost:3500/refreshToken',
          {},
          {
            headers: {
              Authorization: `Bearer ${expiredToken}`,
            },
          }
        );

        const { newToken } = response.data;
        console.log("::::Interceptor, newtoken:::::>", response.data);
        updateToken(newToken); // Update token in local storage
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Update default headers
        error.config.headers.Authorization = `Bearer ${newToken}`; // Update token in failed request
        return api.request(error.config); // Retry with new token
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        throw refreshError; // Let the error propagate
      }
    }
    return Promise.reject(error); // Reject other errors
  }
);

export default api;
