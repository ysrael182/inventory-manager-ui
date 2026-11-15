import api from './api'

export interface SaleItem {
  productId: number
  qty: number
  price: number
  id?: number
  sellId?: number
  product?: {
    name: string
  }
}

export interface Sale {
  id: number
  userId: number
  subtotal: number
  discount: number
  total: number
  note: string
  items?: SaleItem[]
  soldItems?: SaleItem[]
  saleDate?: string
  createdAt?: string
}

interface PaginatedSalesResponse {
  data: Sale[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface CreateSaleInput {
  userId: number
  subtotal: number
  discount: number
  total: number
  note: string
  items: Array<Pick<SaleItem, 'productId' | 'qty' | 'price'>>
}

export async function getSales(): Promise<Sale[]> {
  const response = await api.get<PaginatedSalesResponse>('/sales')
  return response.data.data
}

export async function createSale(data: CreateSaleInput): Promise<Sale> {
  const response = await api.post<Sale>('/sales', data)
  return response.data
}
