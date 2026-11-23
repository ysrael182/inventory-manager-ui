import api from './api';

export async function login(username: string, password: string) {
  const role = 'admin';
  return api.post('/users/login', { username, password, role });
}

export async function getUser(id: number) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
