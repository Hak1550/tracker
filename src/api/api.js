import axios from 'axios';

// Two base URLs supported in parallel
export const BASE_URL_PRIMARY = 'http://15.204.231.252:80/';
export const BASE_URL_SECONDARY = 'http://192.168.4.1/';

export const apiPrimary = axios.create({
  baseURL: BASE_URL_PRIMARY,
  timeout: 15000,
});

export const apiSecondary = axios.create({
  baseURL: BASE_URL_SECONDARY,
  timeout: 15000,
});

// Attach token to both clients if provided
export const setAuthToken = (token) => {
  const applyToken = (client) => {
    if (token) {
      client.defaults.headers.common.Authorization = `${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  };
  applyToken(apiPrimary);
  applyToken(apiSecondary);
};

const normalizeError = (error) =>
  error?.response || { status: 0, data: { message: error.message } };

apiPrimary.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

apiSecondary.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

// Helper to route requests to primary or secondary
export const request = ({ useSecondary = false, ...config }) => {
  const client = useSecondary ? apiSecondary : apiPrimary;
  return client.request(config);
};

// Backwards compatibility: default export primary client
export default apiPrimary;
