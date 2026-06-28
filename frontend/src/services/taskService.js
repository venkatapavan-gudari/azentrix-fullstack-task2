import api from './api';

const taskService = {
  getTasks: async (boardId) => {
    const config = boardId ? { params: { boardId } } : {};
    const response = await api.get('/tasks', config);
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  moveTask: async (id, status) => {
    const response = await api.put(`/tasks/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

export default taskService;
