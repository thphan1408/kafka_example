import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const fetcher: AxiosInstance = axios.create({
  baseURL: 'https://stocktraders.vn/',
  // headers: {
  //   token: ...,
  // },
})

// fetcher.interceptors.request.use((config: AxiosRequestConfig) => {
//   const user = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
//   if (user && user.accessToken) {
//     config.headers = config.headers || {};
//     config.headers['Authorization'] = `Bearer ${user.accessToken}`;
//   }
//   return config;
// });

export default fetcher
