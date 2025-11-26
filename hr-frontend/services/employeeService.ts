// services/employeeService.ts
import api from '../lib/axios'; // lib klasörüne geri çık
import { Employee, HierarchyAssignmentRequest } from '../types'; // types klasörüne geri çık

export const employeeService = {
  getAll: async () => {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
  },

  create: async (data: Partial<Employee>) => {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  assignHierarchy: async (data: HierarchyAssignmentRequest) => {
    const response = await api.post<Employee>('/employees/assign-hierarchy', data);
    return response.data;
  },
  
};