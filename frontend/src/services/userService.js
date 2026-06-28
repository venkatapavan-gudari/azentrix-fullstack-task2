import api from './api';

const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
