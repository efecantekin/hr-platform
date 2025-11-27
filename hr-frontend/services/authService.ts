import api from '../lib/axios';
import { AuthResponse, LoginRequest } from '../types';

export const authService = {
  
  login: async (credentials: LoginRequest) => {
    const response = await api.post<AuthResponse>('http://localhost:8080/auth/login', credentials);
    return response.data;
  },

  
  register: async (data: any) => {
    const response = await api.post('http://localhost:8080/auth/register', data);
    return response.data;
  }
};