import api from "../lib/axios";

export interface JobTitle {
  id: number;
  title: string;
}

export const jobTitleService = {
  getAll: async () => (await api.get<JobTitle[]>("/job-titles")).data,
  create: async (title: string) => (await api.post<JobTitle>("/job-titles", { title })).data,
  delete: async (id: number) => await api.delete(`/job-titles/${id}`),
};
