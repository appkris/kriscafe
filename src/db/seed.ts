import { db } from './kriscafe-db';
import type { Category, MenuItem, StoreSetting } from '../types/database';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-coffee', name: 'Kopi', display_order: 1, created_at: new Date().toISOString() },
  { id: 'cat-non-coffee', name: 'Non-Kopi', display_order: 2, created_at: new Date().toISOString() },
  { id: 'cat-food', name: 'Makanan', display_order: 3, created_at: new Date().toISOString() },
  { id: 'cat-snack', name: 'Camilan', display_order: 4, created_at: new Date().toISOString() },
];

export const INITIAL_MENUS: MenuItem[] = [
  // --- Kopi ---
  {
    id: 'menu-kopi-1',
    category_id: 'cat-coffee',
    name: 'Kopi Susu Gula Aren',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-kopi-2',
    category_id: 'cat-coffee',
    name: 'Americano Dingin / Panas',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: true,
    stock: 999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-kopi-3',
    category_id: 'cat-coffee',
    name: 'Kopi Tubruk Nusantara',
    price: 10000,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: true,
    stock: 999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-kopi-4',
    category_id: 'cat-coffee',
    name: 'Caramel Macchiato',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- Non-Kopi ---
  {
    id: 'menu-non-1',
    category_id: 'cat-non-coffee',
    name: 'Matcha Latte Ice',
    price: 20000,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-non-2',
    category_id: 'cat-non-coffee',
    name: 'Es Teh Manis Segar',
    price: 6000,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: true,
    stock: 999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-non-3',
    category_id: 'cat-non-coffee',
    name: 'Lemon Tea Dingin',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: true,
    stock: 999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-non-4',
    category_id: 'cat-non-coffee',
    name: 'Chocolate Lava Milk',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- Makanan ---
  {
    id: 'menu-food-1',
    category_id: 'cat-food',
    name: 'Nasi Goreng Kris Spesial',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-food-2',
    category_id: 'cat-food',
    name: 'Mie Goreng Tek-Tek',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-food-3',
    category_id: 'cat-food',
    name: 'Rice Bowl Ayam Sambal Matah',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-food-4',
    category_id: 'cat-food',
    name: 'Nasi Ayam Geprek Krispy',
    price: 24000,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // --- Camilan ---
  {
    id: 'menu-snack-1',
    category_id: 'cat-snack',
    name: 'Roti Bakar Cokelat Keju',
    price: 16000,
    image_url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-snack-2',
    category_id: 'cat-snack',
    name: 'Kentang Goreng Renyah',
    price: 14000,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-snack-3',
    category_id: 'cat-snack',
    name: 'Pisang Goreng Crispy Keju',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 12,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'menu-snack-4',
    category_id: 'cat-snack',
    name: 'Cireng Bumbu Rujak (Isi 8)',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&auto=format&fit=crop&q=80',
    is_unlimited_stock: false,
    stock: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSetting[] = [
  { key: 'store_name', value: 'KrisCafe' },
  { key: 'store_tagline', value: 'Kantin & Cafe Sederhana' },
  { key: 'store_address', value: 'Kantin Sentral Lt. 1, Blok B-08' },
  { key: 'store_phone', value: '081234567890' },
  { key: 'receipt_footer', value: 'Terima kasih atas kunjungannya! Selamat menikmati hidangan.' },
  { key: 'currency_symbol', value: 'Rp' },
  { key: 'auth_cashier_pin', value: '1234' },
  { key: 'auth_admin_pin', value: '8888' }
];

/**
 * Inisialisasi data awal jika IndexedDB masih kosong
 */
export async function seedDatabaseIfEmpty(): Promise<boolean> {
  const categoryCount = await db.categories.count();
  
  if (categoryCount === 0) {
    await db.transaction('rw', [db.categories, db.menus, db.settings], async () => {
      await db.categories.bulkAdd(INITIAL_CATEGORIES);
      await db.menus.bulkAdd(INITIAL_MENUS);
      await db.settings.bulkAdd(INITIAL_SETTINGS);
    });
    console.log('✅ KrisCafe IndexedDB successfully seeded with initial categories & menus.');
    return true;
  }

  // Update image_url untuk menu bawaan yang belum memiliki gambar
  for (const initMenu of INITIAL_MENUS) {
    const existing = await db.menus.get(initMenu.id);
    if (existing && !existing.image_url && initMenu.image_url) {
      await db.menus.update(initMenu.id, { image_url: initMenu.image_url });
    }
  }

  // Pastikan PIN default ada meskipun DB sudah pernah di-seed sebelumnya
  const cashierPin = await db.settings.get('auth_cashier_pin');
  if (!cashierPin) {
    await db.settings.put({ key: 'auth_cashier_pin', value: '1234' });
  }

  const adminPin = await db.settings.get('auth_admin_pin');
  if (!adminPin) {
    const oldOwner = await db.settings.get('auth_owner_pin');
    await db.settings.put({ key: 'auth_admin_pin', value: oldOwner?.value || '8888' });
  }

  return false;
}

/**
 * Reset seluruh data menu & kategori ke default (bisa dipanggil dari Settings)
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [db.categories, db.menus, db.settings], async () => {
    await db.categories.clear();
    await db.menus.clear();
    await db.settings.clear();
    
    await db.categories.bulkAdd(INITIAL_CATEGORIES);
    await db.menus.bulkAdd(INITIAL_MENUS);
    await db.settings.bulkAdd(INITIAL_SETTINGS);
  });
}
