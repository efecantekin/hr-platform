import { MenuItem } from '../types';
import api from '../lib/axios';

export const menuService = {
  getTree: async () => {
    const response = await api.get<MenuItem[]>('/menus');
    return response.data;
  },
  create: async (data: Partial<MenuItem>) => {
    const response = await api.post('/menus', data);
    return response.data;
  },
  update: async (id: number, data: Partial<MenuItem>) => {
    const response = await api.put(`/menus/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/menus/${id}`);
  },
  updateOrder: async (items: { id: number; sortOrder: number }[]) => {
    await api.put('/menus/update-order', items);
  }
};