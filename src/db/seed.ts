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
    description: 'Espresso robusta aromatik dipadu susu segar dan sirup gula aren murni.',
    price: 18000,
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
    description: 'Espresso ganda dengan air mineral jernih, rasa bersih dan segar.',
    price: 15000,
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
    description: 'Kopi hitam seduh tradisional khas Nusantara yang pekat dan harum.',
    price: 10000,
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
    description: 'Paduan susu creamy, vanilla syrup, espresso, dan drizzle saus karamel lezat.',
    price: 22000,
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
    description: 'Bubuk teh hijau Jepang premium berpadu lembut dengan susu segar dingin.',
    price: 20000,
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
    description: 'Teh melati wangi khas diseduh segar dengan rasa manis pas pelepas dahaga.',
    price: 6000,
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
    description: 'Perasan jeruk lemon segar berpadu dengan es teh manis menyegarkan.',
    price: 12000,
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
    description: 'Cokelat Belgia pekat dengan susu cair dingin kental nan nikmat.',
    price: 18000,
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
    description: 'Nasi goreng bumbu gurih dengan suwiran ayam, telur mata sapi, dan kerupuk.',
    price: 25000,
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
    description: 'Mie telur tumis sayuran segar, telur orak-arik, dan bumbu racikan khas.',
    price: 18000,
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
    description: 'Nasi hangat dengan fillet ayam renyah dan lumuran sambal matah Bali segar.',
    price: 28000,
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
    description: 'Ayam goreng tepung garing digeprek bersama cabai rawit pedas mantap.',
    price: 24000,
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
    description: 'Roti tebal bakar mentega isi meses cokelat legit dan parutan keju cheddar melimpah.',
    price: 16000,
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
    description: 'Shoestring french fries renyah keemasan disajikan dengan saus sambal dan mayones.',
    price: 14000,
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
    description: 'Pisang kepok manis berbalut tepung renyah dengan susu kental manis dan keju.',
    price: 15000,
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
    description: 'Cireng kenyal gurih digoreng panas ditemani cocolan sambal rujak asam manis pedas.',
    price: 12000,
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

  // Pastikan PIN default ada meskipun DB sudah pernah di-seed sebelumnya
  const cashierPin = await db.settings.get('auth_cashier_pin');
  if (!cashierPin) {
    await db.settings.put({ key: 'auth_cashier_pin', value: '1234' });
  }

  const adminPin = await db.settings.get('auth_admin_pin');
  if (!adminPin) {
    // Cek jika sebelumnya tersimpan sebagai auth_owner_pin
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
