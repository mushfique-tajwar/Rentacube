import { UserAPI } from '../services/api';

export const AuthController = {
  login: async (credentials) => {
    const res = await UserAPI.login(credentials);
    return res.data;
  },
  register: async (data) => {
    const res = await UserAPI.register(data);
    return res.data;
  }
};
