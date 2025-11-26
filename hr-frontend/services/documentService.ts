import api from '../lib/axios';
import { DocumentRequest } from '../types';

export const documentService = {
  create: async (data: Partial<DocumentRequest>) => {
    const response = await api.post<DocumentRequest>('/documents', data);
    return response.data;
  },

  getByEmployee: async (employeeId: number) => {
    const response = await api.get<DocumentRequest[]>(`/documents/employee/${employeeId}`);
    return response.data;
  },

  getPool: async () => {
    const response = await api.get<DocumentRequest[]>('/documents/pool');
    return response.data;
  },

  claim: async (docId: number, hrId: number) => {
    const response = await api.put<DocumentRequest>(`/documents/${docId}/claim?hrId=${hrId}`);
    return response.data;
  }
};