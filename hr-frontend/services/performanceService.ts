import api from "../lib/axios";
import { SurveyTemplate, PerformanceReview, ReviewResponse } from "../types";

export const performanceService = {
  // --- ŞABLON (ANKET) İŞLEMLERİ ---

  createTemplate: async (data: SurveyTemplate) => {
    const response = await api.post<SurveyTemplate>("/performance/templates", data);
    return response.data;
  },

  getAllTemplates: async () => {
    const response = await api.get<SurveyTemplate[]>("/performance/templates");
    return response.data;
  },

  getTemplateById: async (id: number) => {
    const response = await api.get<SurveyTemplate>(`/performance/templates/${id}`);
    return response.data;
  },

  // --- ATAMA İŞLEMLERİ ---

  // Yeni Atama (Dönem ve Tip ile)
  // Omit ile 'id' alanını hariç tutuyoruz çünkü yeni kayıtta id yoktur
  assignReview: async (data: Omit<PerformanceReview, "id">) => {
    const response = await api.post<PerformanceReview>("/performance/reviews", data);
    return response.data;
  },

  // --- DEĞERLENDİRME İŞLEMLERİ ---

  // Reviewer olarak yapmam gerekenler (Bekleyenler)
  getMyPendingReviews: async (reviewerId: number) => {
    const response = await api.get<PerformanceReview[]>(
      `/performance/reviews/reviewer/${reviewerId}`
    );
    return response.data;
  },

  // Employee olarak bana yapılanlar (Geçmişim)
  getMyHistory: async (employeeId: number) => {
    const response = await api.get<PerformanceReview[]>(
      `/performance/reviews/employee/${employeeId}`
    );
    return response.data;
  },

  // Tekil Değerlendirme Detayı
  getReviewDetail: async (id: number) => {
    const response = await api.get<PerformanceReview>(`/performance/reviews/${id}`);
    return response.data;
  },

  // Değerlendirmeyi Kaydet/Gönder
  submitReview: async (id: number, responses: ReviewResponse[]) => {
    const response = await api.put<PerformanceReview>(`/performance/reviews/${id}`, responses);
    return response.data;
  },

  // İK Raporlama (Filtreli Arama)
  searchReviews: async (filters: any) => {
    // Axios params objesi otomatik olarak query string oluşturur
    const response = await api.get<PerformanceReview[]>("/performance/reviews/search", {
      params: filters,
    });
    return response.data;
  },
};
