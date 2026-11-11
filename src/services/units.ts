import api from './api'

export interface Unit {
  id: number
  name: string
  abbreviation: string
  createdAt: string
  updatedAt: string
}

export async function getUnits(): Promise<Unit[]> {
  const response = await api.get<Unit[]>('/units')
  return response.data
}

export async function createUnit(unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
  const response = await api.post<Unit>('/units', unit)
  return response.data
}

export async function updateUnit(id: number, unit: Partial<Unit>): Promise<Unit> {
  const response = await api.put<Unit>(`/units/${id}`, unit)
  return response.data
}

export async function deleteUnit(id: number): Promise<void> {
  await api.delete(`/units/${id}`)
}