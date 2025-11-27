import { SystemScreen } from "../types";
import api from "../lib/axios";

export const screenService = {
  getAll: async () => {
    const response = await api.get<SystemScreen[]>("/screens");
    return response.data;
  },

  create: async (data: { name: string; url: string }) => {
    const response = await api.post<SystemScreen>("/screens", data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/screens/${id}`);
  },
};
