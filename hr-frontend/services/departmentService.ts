import { Department } from "../types";
import api from "../lib/axios";

export const departmentService = {
  getAll: async () => (await api.get<Department[]>("/departments")).data,
  create: async (name: string) => (await api.post<Department>("/departments", { name })).data,
  delete: async (id: number) => await api.delete(`/departments/${id}`),
};
