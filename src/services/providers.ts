import api from './api'

export interface Provider {
  id: number
  name: string
  contact: string
  createdAt: string
  updatedAt: string
}

export async function getProviders(): Promise<Provider[]> {
  const response = await api.get<Provider[]>('/providers')
  return response.data
}

export async function createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  const response = await api.post<Provider>('/providers', provider)
  return response.data
}

export async function updateProvider(id: number, provider: Partial<Provider>): Promise<Provider> {
  const response = await api.put<Provider>(`/providers/${id}`, provider)
  return response.data
}

export async function deleteProvider(id: number): Promise<void> {
  await api.delete(`/providers/${id}`)
}