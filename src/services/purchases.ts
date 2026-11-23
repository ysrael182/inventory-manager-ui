import api from './api';

export interface PurchaseItem {
  id: number;
  price: number;
  qty: number;
  purchaseId: number;
  productId: number;
  product?: {
    name: string;
    unit?: {
      name: string;
      abbreviation: string;
    };
  };
}

export interface Purchase {
  id: number;
  note: string;
  purchaseDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
}

export interface CreatePurchaseInput {
  note: string;
  purchaseDate: string;
  items: Array<Pick<PurchaseItem, 'productId' | 'qty' | 'price'> & { updateQty: boolean }>;
}

export interface PurchaseDateFilters {
  startDate?: string;
  endDate?: string;
}

export async function getPurchases(filters: PurchaseDateFilters = {}): Promise<Purchase[]> {
  const params = {
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
  };
  const response = Object.keys(params).length
    ? await api.get<Purchase[]>('/purchases', { params })
    : await api.get<Purchase[]>('/purchases');
  return response.data;
}

export async function createPurchase(data: CreatePurchaseInput): Promise<Purchase> {
  const response = await api.post<Purchase>('/purchases', data);
  return response.data;
}

export async function getPurchase(id: number): Promise<Purchase> {
  const response = await api.get<Purchase>(`/purchases/${id}`);
  return response.data;
}

export async function updatePurchase(id: number, data: CreatePurchaseInput): Promise<Purchase> {
  const response = await api.put<Purchase>(`/purchases/${id}`, data);
  return response.data;
}

export async function deletePurchase(id: number): Promise<void> {
  await api.delete(`/purchases/${id}`);
}
