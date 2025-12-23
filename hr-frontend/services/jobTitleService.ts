import api from '../lib/axios';
import { JobTitle } from '../types';

export const jobTitleService = {
  getAll: async () => {
    const response = await api.get<JobTitle[]>('/job-titles');
    return response.data;
  },

  create: async (data: { title: string; departmentId: number }) => {
    const response = await api.post<JobTitle>('/job-titles', data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/job-titles/${id}`);
  }
};