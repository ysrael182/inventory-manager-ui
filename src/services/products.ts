import api from './api'

// Type definitions matching the backend response
export interface Unit {
  id: number
  name: string
  abbreviation: string
}

export interface ProductAttribute {
  id: number
  productId: number
  attributeId: number
}

export interface SoldItem {
  id: number
  sellId: number
  productId: number
  qty: number
  price: number
}

export interface Provider {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  identifier: string
  description: string
  price: number
  qty: number
  unitId: number
  createdAt: string
  updatedAt: string
  unit: Unit
  attributes: ProductAttribute[]
  soldItems: SoldItem[]
  // Providers array
  providers: Provider[]
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export type ProductsResponse = PaginatedResponse<Product>

export async function getProducts(query?: string): Promise<ProductsResponse> {
  const params = query ? { q: query } : {}
  const response = await api.get<ProductsResponse>('/products', { params })
  return response.data
}

export async function deleteProduct(id: string | number) {
  return api.delete(`/products/${id}`)
}

export async function updateProduct(id: string | number, data: Partial<Product>) {
  return api.put(`/products/${id}`, data)
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'>) {
  return api.post<Product>('/products', data)
}