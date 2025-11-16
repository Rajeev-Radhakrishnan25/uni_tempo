import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@/src/config/api';
import { ApiError } from '@/src/types/auth';
import { storageService, STORAGE_KEYS } from './storage';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          statusCode: error.response?.status,
        };

        if (error.response?.data) {
          const data = error.response.data as any;
          apiError.message = data.message || data.error || apiError.message;
          apiError.error = data.error;
        } else if (error.message) {
          apiError.message = error.message;
        }

        return Promise.reject(apiError);
      }
    );
  }

  public async setAuthToken(token: string): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  public async clearAuthToken(): Promise<void> {
    await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  public async getAuthToken(): Promise<string | null> {
    return await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  public get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params }).then(response => response.data);
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data).then(response => {
        return response.data;
    });
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data).then(response => response.data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.client.delete(url).then(response => response.data);
  }
}

export const apiService = new ApiService();