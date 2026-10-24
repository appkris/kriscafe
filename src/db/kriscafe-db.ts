import Dexie, { type Table } from 'dexie';
import type { 
  Category, 
  MenuItem, 
  Transaction, 
  TransactionItem, 
  CashierShift, 
  StoreSetting 
} from '../types/database';

export class KrisCafeDatabase extends Dexie {
  categories!: Table<Category, string>;
  menus!: Table<MenuItem, string>;
  transactions!: Table<Transaction, string>;
  transaction_items!: Table<TransactionItem, string>;
  cashier_shifts!: Table<CashierShift, string>;
  settings!: Table<StoreSetting, string>;

  constructor() {
    super('KrisCafeDB');

    this.version(1).stores({
      categories: 'id, name, display_order',
      menus: 'id, category_id, name, is_active, is_unlimited_stock',
      transactions: 'id, invoice_number, payment_method, order_type, status, synced_to_server, created_at',
      transaction_items: 'id, transaction_id, menu_id',
      cashier_shifts: 'id, cashier_name, status, start_time',
      settings: 'key'
    });
  }
}

export const db = new KrisCafeDatabase();
