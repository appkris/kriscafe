import { db } from '../kriscafe-db';
import type { Category } from '../../types/database';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return await db.categories
      .orderBy('display_order')
      .toArray();
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  }
};

export const settingsRepository = {
  async getAll(): Promise<Record<string, string>> {
    const list = await db.settings.toArray();
    return list.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  },

  async get(key: string, defaultValue: string = ''): Promise<string> {
    const item = await db.settings.get(key);
    return item ? item.value : defaultValue;
  },

  async set(key: string, value: string): Promise<void> {
    await db.settings.put({ key, value });
  }
};
