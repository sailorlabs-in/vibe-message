import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api'
    ? import.meta.env.VITE_API_URL
    : `${window.location.origin}/api`;
const activeControllers = new Map<string, AbortController>();

// Endpoints that should not be cancelled if multiple requests happen
const NO_CANCEL_ENDPOINTS = ['/auth/me'];

const shouldSkipCancellation = (url: string): boolean => {
  return NO_CANCEL_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

export const cancelAllActiveRequests = () => {
  activeControllers.forEach((controller, key) => {
    const url = key.split(':')[1];
    if (shouldSkipCancellation(url)) {
      return;
    }
    controller.abort();
  });
  const keysToDelete: string[] = [];
  activeControllers.forEach((_, key) => {
    const url = key.split(':')[1];
    if (!shouldSkipCancellation(url)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => activeControllers.delete(key));
};

export const cancelRequest = (url: string, method = 'GET') => {
  const reqKey = `${method.toUpperCase()}:${url}`;
  const controller = activeControllers.get(reqKey);
  if (controller) {
    controller.abort();
    activeControllers.delete(reqKey);
  }
};

const ApiRequest = async (
  url: string,
  method: 'get' | 'post' | 'patch' | 'delete' | 'put',
  data = {},
  isUseAccessToken = true,
  signal?: AbortSignal
) => {
  const reqKey = `${method.toUpperCase()}:${url}`;

  let requestSignal = signal;
  if (method.toLowerCase() === 'get') {
    if (activeControllers.has(reqKey)) {
      const existingController = activeControllers.get(reqKey);
      existingController?.abort();
    }

    const controller = new AbortController();
    activeControllers.set(reqKey, controller);

    requestSignal = signal || controller.signal;
  }

  const token = localStorage.getItem('token');

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (isUseAccessToken && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const apiRequestPayload: AxiosRequestConfig = {
    url: API_BASE_URL + url,
    method,
    data,
    headers,
    responseType: 'json',
    signal: requestSignal,
  };

  try {
    const response = await axios(apiRequestPayload);

    if (method.toLowerCase() === 'get' && activeControllers.has(reqKey)) {
      activeControllers.delete(reqKey);
    }

    return response.data;
  } catch (error: any) {
    if (method.toLowerCase() === 'get' && activeControllers.has(reqKey)) {
      activeControllers.delete(reqKey);
    }

    if (axios.isCancel(error) || error.name === 'AbortError' || error.name === 'CanceledError') {
      // eslint-disable-next-line preserve-caught-error
      throw new Error('Request Cancelled');
    }

    if (error.response?.status === 401 && isUseAccessToken) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    throw error;
  }
};

export default ApiRequest;
