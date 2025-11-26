import api from '../lib/axios';
import { LeaveRequest } from '../types';

export const leaveService = {
  // Yeni talep oluştur
  create: async (data: Partial<LeaveRequest>) => {
    const response = await api.post<LeaveRequest>('/leaves', data);
    return response.data;
  },

  // Çalışanın izinlerini getir
  getByEmployee: async (employeeId: number) => {
    const response = await api.get<LeaveRequest[]>(`/leaves/employee/${employeeId}`);
    return response.data;
  },

  // Onay bekleyenleri getir (Yönetici)
  getPending: async () => {
    const response = await api.get<LeaveRequest[]>('/leaves/pending');
    return response.data;
  },

  // Durum güncelle (Onayla/Reddet)
  updateStatus: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.put<LeaveRequest>(`/leaves/${id}/status?status=${status}`);
    return response.data;
  }
};