import React from 'react';
import { Coffee } from 'lucide-react';
import type { MenuItem } from '../../types/database';
import { MenuCard } from './MenuCard';
import './MenuGrid.css';

interface MenuGridProps {
  menus: MenuItem[];
  cartItemCounts: Record<string, number>;
  onAddToCart: (menu: MenuItem) => void;
  onOpenNotesModal: (menu: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  menus,
  cartItemCounts,
  onAddToCart,
  onOpenNotesModal
}) => {
  if (menus.length === 0) {
    return (
      <div className="menu-grid--empty">
        <Coffee size={36} strokeWidth={1.5} />
        <div>
          <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
            Menu Tidak Ditemukan
          </div>
          <div style={{ fontSize: 'var(--text-xs)' }}>
            Coba ganti kata kunci pencarian atau pilih kategori lain.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-grid">
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          inCartQuantity={cartItemCounts[menu.id] || 0}
          onAddToCart={onAddToCart}
          onOpenNotesModal={onOpenNotesModal}
        />
      ))}
    </div>
  );
};
