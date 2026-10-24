import React, { useState } from 'react';
import { Plus, MessageSquarePlus, Utensils, Coffee } from 'lucide-react';
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
  const [imgError, setImgError] = useState<boolean>(false);
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

  const isCoffee = menu.category_id.includes('coffee') || menu.category_id.includes('kopi');

  return (
    <div
      className={`menu-card ${isOutOfStock ? 'menu-card--disabled' : ''} ${inCartQuantity > 0 ? 'menu-card--in-cart' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
    >
      {/* Gambar Foto Menu / Visual Thumbnail */}
      <div className="menu-card__image-wrapper">
        {menu.image_url && !imgError ? (
          <img
            src={menu.image_url}
            alt={menu.name}
            className="menu-card__image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="menu-card__image-placeholder">
            {isCoffee ? <Coffee size={28} /> : <Utensils size={28} />}
          </div>
        )}

        {/* Badge Jumlah di Keranjang (Top Left) */}
        {inCartQuantity > 0 && (
          <div className="menu-card__cart-badge">{inCartQuantity}x</div>
        )}

        {/* Badge Status Stok (Top Right) */}
        <div className="menu-card__stock-badge">
          {isOutOfStock ? (
            <Badge variant="danger">HABIS</Badge>
          ) : !menu.is_unlimited_stock && menu.stock <= 5 ? (
            <Badge variant="warning">Sisa {menu.stock}</Badge>
          ) : null}
        </div>
      </div>

      {/* Konten Menu Ringkas: Nama & Harga */}
      <div className="menu-card__body">
        <h3 className="menu-card__name" title={menu.name}>{menu.name}</h3>

        <div className="menu-card__bottom">
          <span className="menu-card__price">{formatRupiah(menu.price)}</span>

          <div className="menu-card__actions">
            {!isOutOfStock && (
              <button
                type="button"
                className="menu-card__action-btn"
                onClick={handleNotesClick}
                title="Tambah catatan khusus"
              >
                <MessageSquarePlus size={15} />
              </button>
            )}

            <button
              type="button"
              className="menu-card__action-btn menu-card__action-btn--add"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              title="Tambah ke pesanan"
              disabled={isOutOfStock}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
