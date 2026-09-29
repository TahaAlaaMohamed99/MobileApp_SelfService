import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { store } from '../store';

const logoutAndRedirect = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await AsyncStorage.removeItem('user');
  router.replace('/(auth)/login');
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const apiUrl = await SecureStore.getItemAsync('apiUrl');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const { data } = await axios.post(`${apiUrl}/api/Authentication/RefreshToken`, {
        refreshToken: `${refreshToken}`,
      });

      await SecureStore.setItemAsync('accessToken', data.token);
      if (data.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      }

      return data.token;
    } catch (error) {
      await logoutAndRedirect();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const instance = axios.create({
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(async (config) => {
  const apiUrl = await SecureStore.getItemAsync('apiUrl');
  const accessToken = await SecureStore.getItemAsync('accessToken');
 
  const currentLanguage = store.getState().themeSlice.currentLanguage;
   config.baseURL = `${apiUrl}/api/`;
  config.headers['Accept-Language'] = currentLanguage || 'en';
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
    return config;
});

instance.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        details: error.message,
      });
    }

    if (error.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        return Promise.reject({
          message: 'You are not logged in. Please log in again.',
          details: error.response.data,
        });
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance(originalRequest);
    }

    if (error.response.status >= 500 && error.response.status < 600) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        details: error.response.data,
      });
    }

    if (error.response.status >= 400 && error.response.status < 500) {
      return Promise.reject({
        ...(error.response.data || {}),
        message: error.response.data?.message || 'An error occurred. Please try again.',
        details: error.response.data,
      });
    }

    return Promise.reject({
      message: 'An unexpected error occurred. Please try again.',
      details: error.response.data,
    });
  }
);

export const getApi = () => instance;
