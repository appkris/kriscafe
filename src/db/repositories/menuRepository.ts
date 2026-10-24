import { db } from '../kriscafe-db';
import type { MenuItem } from '../../types/database';

export const menuRepository = {
  async getAll(): Promise<MenuItem[]> {
    return await db.menus.toArray();
  },

  async getActive(): Promise<MenuItem[]> {
    return await db.menus.filter(m => m.is_active).toArray();
  },

  async getByCategory(categoryId: string): Promise<MenuItem[]> {
    if (categoryId === 'all') {
      return await db.menus.filter(m => m.is_active).toArray();
    }
    return await db.menus
      .where('category_id')
      .equals(categoryId)
      .and(m => m.is_active)
      .toArray();
  },

  async getById(id: string): Promise<MenuItem | undefined> {
    return await db.menus.get(id);
  },

  async search(query: string, categoryId: string = 'all'): Promise<MenuItem[]> {
    const cleanQuery = query.toLowerCase().trim();
    return await db.menus
      .filter(m => {
        const matchesCategory = categoryId === 'all' || m.category_id === categoryId;
        const matchesQuery = m.name.toLowerCase().includes(cleanQuery) || 
                             (m.description?.toLowerCase().includes(cleanQuery) ?? false);
        return matchesCategory && matchesQuery && m.is_active;
      })
      .toArray();
  },

  async updateStock(id: string, newStock: number): Promise<void> {
    await db.menus.update(id, {
      stock: Math.max(0, newStock),
      updated_at: new Date().toISOString()
    });
  },

  async toggleActive(id: string): Promise<boolean> {
    const item = await db.menus.get(id);
    if (!item) return false;
    const newStatus = !item.is_active;
    await db.menus.update(id, {
      is_active: newStatus,
      updated_at: new Date().toISOString()
    });
    return newStatus;
  },

  async toggleUnlimited(id: string): Promise<boolean> {
    const item = await db.menus.get(id);
    if (!item) return false;
    const newUnlimited = !item.is_unlimited_stock;
    await db.menus.update(id, {
      is_unlimited_stock: newUnlimited,
      updated_at: new Date().toISOString()
    });
    return newUnlimited;
  }
};
