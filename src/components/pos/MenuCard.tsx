import React from 'react';
import { Plus, MessageSquarePlus } from 'lucide-react';
import type { MenuItem } from '../../types/database';
import { Badge } from '../common/Badge';
import './MenuCard.css';

interface MenuCardProps {
  menu: MenuItem;
  inCartQuantity?: number;
  onAddToCart: (menu: MenuItem) => void;
  onOpenNotesModal: (menu: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  inCartQuantity = 0,
  onAddToCart,
  onOpenNotesModal
}) => {
  const isOutOfStock = !menu.is_unlimited_stock && menu.stock <= 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCardClick = () => {
    if (!isOutOfStock) {
      onAddToCart(menu);
    }
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenNotesModal(menu);
  };

  return (
    <div
      className={`menu-card ${isOutOfStock ? 'menu-card--disabled' : ''} ${inCartQuantity > 0 ? 'menu-card--in-cart' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
    >
      {/* Badge jumlah di keranjang */}
      {inCartQuantity > 0 && (
        <div className="menu-card__cart-badge">{inCartQuantity}x</div>
      )}

      <div>
        <div className="menu-card__top">
          <span className="menu-card__name">{menu.name}</span>
          {isOutOfStock ? (
            <Badge variant="danger">HABIS</Badge>
          ) : menu.is_unlimited_stock ? (
            <Badge variant="default">Unlimited</Badge>
          ) : (
            <Badge variant={menu.stock <= 5 ? 'warning' : 'success'}>
              Sisa {menu.stock}
            </Badge>
          )}
        </div>

        {menu.description && (
          <p className="menu-card__desc">{menu.description}</p>
        )}
      </div>

      <div className="menu-card__bottom">
        <span className="menu-card__price">{formatRupiah(menu.price)}</span>

        <div className="menu-card__actions">
          {/* Tombol Catatan Tambahan */}
          {!isOutOfStock && (
            <button
              type="button"
              className="menu-card__note-btn"
              onClick={handleNotesClick}
              title="Tambah varian atau catatan"
            >
              <MessageSquarePlus size={16} />
            </button>
          )}

          {/* Tombol Tambah Cepat */}
          <button
            type="button"
            className="menu-card__note-btn"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderColor: 'var(--accent-border)' }}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            title="Tambah ke keranjang"
            disabled={isOutOfStock}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
