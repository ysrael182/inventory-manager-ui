import api from './api'

export async function getProducts(query?: string) {
  const params = query ? { q: query } : {}
  return api.get('/products', { params })
}