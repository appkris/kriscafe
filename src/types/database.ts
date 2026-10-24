/**
 * Database Type Definitions for KrisCafe
 * Sesuai skema di docs/DATABASE_SCHEMA.md
 */

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;              // Rupiah integer (e.g. 18000)
  image_url?: string;
  is_unlimited_stock: boolean;
  stock: number;              // Sisa porsi
  is_active: boolean;         // Tersedia / Dinonaktifkan
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type TransactionStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface Transaction {
  id: string;                 // e.g. KC-20261024-0001
  invoice_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_due: number;
  customer_name?: string;
  table_number?: string;
  order_type: OrderType;
  cashier_name: string;
  status: TransactionStatus;
  device_id?: string;         // Pondasi Multi-Device: e.g. KASIR-01, KASIR-02
  synced_to_server: boolean;
  synced_at?: string;         // Timestamp saat data berhasil diunggah ke cloud
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  menu_id: string;
  menu_name: string;
  price: number;
  quantity: number;
  notes?: string;
  item_subtotal: number;
}

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CashierShift {
  id: string;
  device_id?: string;         // Pondasi Multi-Device: e.g. KASIR-01
  cashier_name: string;
  start_time: string;
  end_time?: string;
  starting_cash: number;      // Modal uang kembalian di laci kasir
  expected_cash?: number;     // starting_cash + total penjualan tunai
  actual_cash?: number;       // Uang fisik saat tutup kasir
  cash_difference?: number;   // Selisih (actual - expected)
  status: ShiftStatus;
}

export interface StoreSetting {
  key: string;
  value: string;
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalTransactions: number;
  totalCash: number;
  totalQris: number;
  totalItemsSold: number;
  topSellingItems: {
    menu_id: string;
    menu_name: string;
    quantity: number;
    revenue: number;
  }[];
}
