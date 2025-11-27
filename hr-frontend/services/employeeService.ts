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
};
