import api from './api';

export interface SaleItem {
  productId: number;
  qty: number;
  price: number;
  id?: number;
  sellId?: number;
  product?: {
    name: string;
  };
}

export interface Sale {
  id: number;
  userId: number;
  subtotal: number;
  discount: number;
  total: number;
  note: string;
  items?: SaleItem[];
  soldItems?: SaleItem[];
  saleDate?: string;
  createdAt?: string;
}

interface PaginatedSalesResponse {
  data: Sale[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface SalesDateFilters {
  startDate?: string;
  endDate?: string;
}

export interface CreateSaleInput {
  userId: number;
  subtotal: number;
  discount: number;
  total: number;
  note: string;
  saleDate: string;
  items: Array<Pick<SaleItem, 'productId' | 'qty' | 'price'> & { updateQty: boolean }>;
}

export async function getSales(filters: SalesDateFilters = {}): Promise<Sale[]> {
  const params = {
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
  };
  const response = Object.keys(params).length
    ? await api.get<PaginatedSalesResponse>('/sales', { params })
    : await api.get<PaginatedSalesResponse>('/sales');

  return response.data.data;
}

export async function createSale(data: CreateSaleInput): Promise<Sale> {
  const response = await api.post<Sale>('/sales', data);
  return response.data;
}

export async function updateSale(id: number, data: CreateSaleInput): Promise<Sale> {
  const response = await api.put<Sale>(`/sales/${id}`, data);
  return response.data;
}

export async function deleteSale(id: number): Promise<void> {
  await api.delete(`/sales/${id}`);
}

export async function getSaleById(id: number): Promise<Sale> {
  const response = await api.get<Sale>(`/sales/${id}`);
  return response.data;
}
