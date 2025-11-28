import api from "../lib/axios";
import { Employee, HierarchyAssignmentRequest } from "../types";

export const employeeService = {
  getAll: async () => {
    const response = await api.get<Employee[]>("/employees");
    return response.data;
  },

  create: async (data: Partial<Employee>) => {
    const response = await api.post<Employee>("/employees", data);
    return response.data;
  },

  assignHierarchy: async (data: HierarchyAssignmentRequest) => {
    const response = await api.post<Employee>("/employees/assign-hierarchy", data);
    return response.data;
  },

  getMyTeam: async (managerId: number) => {
    const response = await api.get<Employee[]>(`/employees/manager/${managerId}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  // Personel Güncelle
  update: async (id: number, data: Partial<Employee>) => {
    // Backend'de update metodu genellikle PUT veya PATCH olur
    // Eğer backend'de özel update metodu yoksa create gibi post atabilirsin ama doğrusu PUT'tur.
    // Backend'de "updateEmployee" metodun varsa ona göre ayarla.
    // Şimdilik standart REST PUT varsayıyorum:
    const response = await api.put<Employee>(`/employees/${id}`, data); // Backend'de bu uç yoksa eklemeliyiz!
    return response.data;
  },
};
