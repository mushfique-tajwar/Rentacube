import { ListingAPI } from '../services/api';

export const ListingController = {
  create: async (formData) => {
    const res = await ListingAPI.create(formData);
    return res.data;
  },
  list: async (params) => {
    const res = await ListingAPI.all(params);
    return res.data;
  },
  get: async (id) => {
    const res = await ListingAPI.byId(id);
    return res.data;
  }
};
