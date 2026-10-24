import { db } from '../kriscafe-db';
import type { 
  Transaction, 
  TransactionItem, 
  PaymentMethod, 
  OrderType, 
  DailySummary 
} from '../../types/database';

export interface CheckoutItemInput {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CreateTransactionDTO {
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  customerName?: string;
  tableNumber?: string;
  orderType: OrderType;
  cashierName: string;
  items: CheckoutItemInput[];
}

export const transactionRepository = {
  /**
   * Menghasilkan invoice number unik harian (Format: KC-YYYYMMDD-XXXX)
   */
  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20261024
    
    // Hitung jumlah transaksi yang terjadi hari ini
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const countToday = await db.transactions
      .where('created_at')
      .aboveOrEqual(startOfDay)
      .count();

    const sequence = String(countToday + 1).padStart(4, '0');
    return `KC-${dateStr}-${sequence}`;
  },

  /**
   * Menyimpan transaksi secara atomik di IndexedDB & memotong stok menu secara otomatis
   */
  async create(dto: CreateTransactionDTO): Promise<{ transaction: Transaction; items: TransactionItem[] }> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newTransaction: Transaction = {
      id: transactionId,
      invoice_number: invoiceNumber,
      subtotal: dto.subtotal,
      discount: dto.discount || 0,
      tax: dto.tax || 0,
      total: dto.total,
      payment_method: dto.paymentMethod,
      amount_paid: dto.amountPaid,
      change_due: dto.changeDue,
      customer_name: dto.customerName || undefined,
      table_number: dto.tableNumber || undefined,
      order_type: dto.orderType,
      cashier_name: dto.cashierName,
      status: 'COMPLETED',
      synced_to_server: false,
      created_at: now
    };

    const newItems: TransactionItem[] = dto.items.map((item, index) => ({
      id: `item-${transactionId}-${index + 1}`,
      transaction_id: transactionId,
      menu_id: item.menuId,
      menu_name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      item_subtotal: item.price * item.quantity
    }));

    // Eksekusi atomik: simpan transaksi, item transaksi, dan kurangi stok
    await db.transaction('rw', [db.transactions, db.transaction_items, db.menus], async () => {
      await db.transactions.add(newTransaction);
      await db.transaction_items.bulkAdd(newItems);

      // Potong stok porsi untuk menu yang bukan unlimited
      for (const item of dto.items) {
        const menuItem = await db.menus.get(item.menuId);
        if (menuItem && !menuItem.is_unlimited_stock) {
          const updatedStock = Math.max(0, menuItem.stock - item.quantity);
          await db.menus.update(item.menuId, {
            stock: updatedStock,
            updated_at: now
          });
        }
      }
    });

    return { transaction: newTransaction, items: newItems };
  },

  async getRecent(limit: number = 20): Promise<Transaction[]> {
    return await db.transactions
      .orderBy('created_at')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async getByIdWithItems(transactionId: string): Promise<{ transaction: Transaction; items: TransactionItem[] } | null> {
    const transaction = await db.transactions.get(transactionId);
    if (!transaction) return null;

    const items = await db.transaction_items
      .where('transaction_id')
      .equals(transactionId)
      .toArray();

    return { transaction, items };
  },

  /**
   * Menghitung rangkuman omzet dan menu terlaris hari ini
   */
  async getDailySummary(): Promise<DailySummary> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const transactions = await db.transactions
      .where('created_at')
      .aboveOrEqual(startOfDay)
      .filter(t => t.status === 'COMPLETED')
      .toArray();

    let totalRevenue = 0;
    let totalCash = 0;
    let totalQris = 0;

    const transactionIds = transactions.map(t => {
      totalRevenue += t.total;
      if (t.payment_method === 'CASH') totalCash += t.total;
      if (t.payment_method === 'QRIS') totalQris += t.total;
      return t.id;
    });

    // Ambil seluruh detail item hari ini untuk statistik menu terlaris
    const items = await db.transaction_items
      .where('transaction_id')
      .anyOf(transactionIds)
      .toArray();

    const itemMap = new Map<string, { menu_id: string; menu_name: string; quantity: number; revenue: number }>();
    let totalItemsSold = 0;

    for (const item of items) {
      totalItemsSold += item.quantity;
      const existing = itemMap.get(item.menu_id) || {
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        quantity: 0,
        revenue: 0
      };
      existing.quantity += item.quantity;
      existing.revenue += item.item_subtotal;
      itemMap.set(item.menu_id, existing);
    }

    const topSellingItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      date: today.toISOString().slice(0, 10),
      totalRevenue,
      totalTransactions: transactions.length,
      totalCash,
      totalQris,
      totalItemsSold,
      topSellingItems
    };
  }
};
