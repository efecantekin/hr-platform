import { Position } from "../types";
import api from "../lib/axios";

export const positionService = {
  getAll: async () => {
    const response = await api.get<Position[]>("/positions");
    return response.data;
  },

  create: async (title: string) => {
    const response = await api.post<Position>("/positions", { title });
    return response.data;
  },

  update: async (id: number, title: string) => {
    const response = await api.put<Position>(`/positions/${id}`, { title });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/positions/${id}`);
  },
};
