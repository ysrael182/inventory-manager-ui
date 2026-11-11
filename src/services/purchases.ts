import api from './api'

export interface PurchaseItem {
  id: number
  price: number
  qty: number
  purchaseId: number
  productId: number
}

export interface Purchase {
  id: number
  note: string
  purchaseDate: string
  createdAt: string
  updatedAt: string
  items: PurchaseItem[]
}

export interface CreatePurchaseInput {
  note: string
  purchaseDate: string
  items: Array<Pick<PurchaseItem, 'productId' | 'qty' | 'price'>>
}

export async function getPurchases(): Promise<Purchase[]> {
  const response = await api.get<Purchase[]>('/purchases')
  return response.data
}

export async function createPurchase(data: CreatePurchaseInput): Promise<Purchase> {
  const response = await api.post<Purchase>('/purchases', data)
  return response.data
}
