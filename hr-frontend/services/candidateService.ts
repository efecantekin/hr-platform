import api from "../lib/axios";
import { Candidate } from "../types";

export const candidateService = {
  // 1. Arama ve Filtreleme
  search: async (filters: any) => {
    const params = new URLSearchParams();
    if (filters.technologies) params.append("technologies", filters.technologies);
    if (filters.experienceYears)
      params.append("experienceYears", filters.experienceYears.toString());
    if (filters.university) params.append("university", filters.university);
    if (filters.department) params.append("department", filters.department);
    if (filters.referenceType) params.append("referenceType", filters.referenceType);

    const response = await api.get<Candidate[]>(`/candidates/search?${params.toString()}`);
    return response.data;
  },

  // 2. Yeni Kayıt
  create: async (data: Partial<Candidate>) => {
    const response = await api.post<Candidate>("/candidates", data);
    return response.data;
  },

  // 3. Tam Güncelleme (YENİ EKLENEN KISIM)
  update: async (id: number, data: Partial<Candidate>) => {
    const response = await api.put<Candidate>(`/candidates/${id}`, data);
    return response.data;
  },

  // 4. Sadece Statü Güncelleme (Hızlı işlem için kalabilir)
  updateStatus: async (id: number, status: string) => {
    const response = await api.put<Candidate>(`/candidates/${id}/status?status=${status}`);
    return response.data;
  },
};
