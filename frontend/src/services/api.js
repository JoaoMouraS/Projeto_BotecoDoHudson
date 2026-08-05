const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const requestInterceptors = [];
const responseInterceptors = [];

async function applyRequestInterceptors(config) {
  let finalConfig = { ...config };

  for (const interceptor of requestInterceptors) {
    finalConfig = (await interceptor(finalConfig)) || finalConfig;
  }

  return finalConfig;
}

async function applyResponseInterceptors(response, config) {
  let finalResponse = response;

  for (const interceptor of responseInterceptors) {
    finalResponse = (await interceptor(finalResponse, config)) || finalResponse;
  }

  return finalResponse;
}

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const headers = options.headers || {};
  const body = options.body;
  const token = localStorage.getItem('token');

  const config = await applyRequestInterceptors({
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, config);
  const responseWithInterceptors = await applyResponseInterceptors(response, config);

  if (!responseWithInterceptors.ok) {
    const error = new Error('Request failed');
    const errorPayload = await responseWithInterceptors.text();

    try {
      error.response = {
        status: responseWithInterceptors.status,
        data: JSON.parse(errorPayload),
      };
    } catch {
      error.response = {
        status: responseWithInterceptors.status,
        data: errorPayload,
      };
    }

    throw error;
  }

  const contentType = responseWithInterceptors.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await responseWithInterceptors.json()
    : await responseWithInterceptors.text();

  return {
    data: payload,
    status: responseWithInterceptors.status,
    headers: responseWithInterceptors.headers,
  };
}

const api = {
  interceptors: {
    request: {
      use: (callback) => requestInterceptors.push(callback),
    },
    response: {
      use: (callback) => responseInterceptors.push(callback),
    },
  },
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;