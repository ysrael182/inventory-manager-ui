import api from './api';

export interface ReportDateFilters {
  startDate?: string;
  endDate?: string;
}

export interface ProductSalesReportRow {
  productId: number;
  productName: string;
  quantity: number;
  grossAmount: number;
  discount: number;
  netAmount: number;
}

export interface ProductSalesReport {
  summary: {
    saleCount: number;
    quantity: number;
    subtotal: number;
    discount: number;
    total: number;
  };
  products: ProductSalesReportRow[];
}

export interface PurchaseReportProduct {
  productId: number;
  productName: string;
  quantity: number;
  totalAmount: number;
}

export interface PurchaseReport {
  summary: {
    purchaseCount: number;
    quantity: number;
    totalAmount: number;
  };
  products: PurchaseReportProduct[];
}

export type SalesPeriod = 'day' | 'week' | 'month' | 'year';

export interface SalesPeriodReportBucket {
  period: string;
  saleCount: number;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface PurchasePeriodReportBucket {
  period: string;
  purchaseCount: number;
  quantity: number;
  totalAmount: number;
}

export interface ProductSalesHistoryBucket {
  period: string;
  quantity: number;
  grossAmount: number;
  discount: number;
  netAmount: number;
}

export interface UserSalesReportRow {
  userId: number;
  username: string;
  productId: number;
  productName: string;
  quantity: number;
  grossAmount: number;
  discount: number;
  netAmount: number;
}

export async function getProductSalesReport(
  filters: ReportDateFilters = {}
): Promise<ProductSalesReport> {
  const response = await api.get<ProductSalesReport>('/reports/sales/products', {
    params: filters,
  });
  return response.data;
}

export async function getPurchaseReport(filters: ReportDateFilters = {}): Promise<PurchaseReport> {
  const response = await api.get<PurchaseReport>('/reports/purchases', { params: filters });
  return response.data;
}

export async function getSalesPeriodReport(
  period: SalesPeriod,
  filters: ReportDateFilters = {}
): Promise<SalesPeriodReportBucket[]> {
  const response = await api.get<SalesPeriodReportBucket[]>('/reports/sales/period', {
    params: { ...filters, period },
  });
  return response.data;
}

export async function getPurchasePeriodReport(
  period: SalesPeriod,
  filters: ReportDateFilters = {}
): Promise<PurchasePeriodReportBucket[]> {
  const response = await api.get<PurchasePeriodReportBucket[]>('/reports/purchases/period', {
    params: { ...filters, period },
  });
  return response.data;
}

export async function getProductSalesHistory(
  productId: number,
  period: SalesPeriod,
  filters: ReportDateFilters = {}
): Promise<ProductSalesHistoryBucket[]> {
  const response = await api.get<ProductSalesHistoryBucket[]>(
    `/reports/products/${productId}/sales`,
    { params: { ...filters, period } }
  );
  return response.data;
}

export async function getUserSalesReport(
  filters: ReportDateFilters = {}
): Promise<UserSalesReportRow[]> {
  const response = await api.get<UserSalesReportRow[]>('/reports/sales/users', { params: filters });
  return response.data;
}
