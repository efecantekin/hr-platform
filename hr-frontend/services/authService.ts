import api from '../lib/axios';
import { AuthResponse, LoginRequest } from '../types';

export const authService = {
  // Login işlemi
  login: async (credentials: LoginRequest) => {
    // Gateway'de Auth servisi /auth path'indedir. 
    // api instance'ı /api'ye bakar, bu yüzden tam URL veya path düzeltmesi gerekebilir.
    // En temiz yöntem, api instance'ını kullanıp path'i manuel vermektir (eğer gateway yönlendiriyorsa).
    // Ancak senin Gateway ayarında Auth için '/auth/**' tanımlı.
    // api instance baseURL'i 'http://localhost:8080/api' idi.
    // Auth için bunu 'http://localhost:8080/auth' olarak kullanmalıyız.
    
    // Geçici çözüm: Auth için direkt axios kullanmak veya baseURL'i ezmek.
    // Biz api instance üzerinden gidelim ama url'i replace edelim veya gateway'de auth'u da /api/auth yapalım.
    // Şimdilik en kolayı tam URL vermektir:
    const response = await api.post<AuthResponse>('http://localhost:8080/auth/login', credentials);
    return response.data;
  },

  // Kayıt işlemi (Admin panelinden değil, dışarıdan kayıt için gerekirse)
  register: async (data: any) => {
    const response = await api.post('http://localhost:8080/auth/register', data);
    return response.data;
  }
};