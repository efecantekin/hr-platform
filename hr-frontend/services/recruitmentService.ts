import api from '../lib/axios';
import { JobPosition, JobApplication, Candidate } from '../types';

export const recruitmentService = {
  // ... (Eski Aday metodları burada kalacak) ...
  
  // --- POZİSYON İŞLEMLERİ ---
  getAllJobs: async () => {
    const response = await api.get<JobPosition[]>('/jobs');
    return response.data;
  },

  getJobById: async (id: number) => {
    const response = await api.get<JobPosition>(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: Partial<JobPosition>) => {
    const response = await api.post<JobPosition>('/jobs', data);
    return response.data;
  },

  // --- SÜREÇ İŞLEMLERİ ---
  addCandidateToJob: async (jobId: number, data: Partial<JobApplication>) => {
    const response = await api.post<JobApplication>(`/jobs/${jobId}/apply`, data);
    return response.data;
  },

  updateApplicationStatus: async (appId: number, status: string) => {
    const response = await api.put<JobApplication>(`/jobs/applications/${appId}/status?status=${status}`);
    return response.data;
  },

  // Yardımcı: Adayları getir (Dropdown için)
  getAllCandidates: async () => {
    const response = await api.get<Candidate[]>('/candidates');
    return response.data;
  }
};