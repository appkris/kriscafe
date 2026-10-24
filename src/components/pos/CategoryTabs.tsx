import React from 'react';
import type { Category } from '../../types/database';
import './CategoryTabs.css';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount
}) => {
  return (
    <nav className="category-tabs-container" aria-label="Kategori Menu">
      <button
        type="button"
        className={`category-tab-btn ${selectedCategory === 'all' ? 'category-tab-btn--active' : ''}`}
        onClick={() => onSelectCategory('all')}
      >
        <span>Semua Menu</span>
        {totalCount !== undefined && (
          <span className="category-tab-count">{totalCount}</span>
        )}
      </button>

      {categories.map((cat) => {
        const count = categoryCounts ? categoryCounts[cat.id] : undefined;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            className={`category-tab-btn ${isActive ? 'category-tab-btn--active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span>{cat.name}</span>
            {count !== undefined && (
              <span className="category-tab-count">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
