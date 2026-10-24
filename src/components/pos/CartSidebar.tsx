import React from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Utensils, 
  Package, 
  ArrowRight,
  X
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useConfirmStore } from '../../store/confirmStore';
import { Button } from '../common/Button';
import './CartSidebar.css';

interface CartSidebarProps {
  onProceedToCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    orderType,
    isMobileCartOpen,
    removeItem,
    updateQuantity,
    setOrderType,
    setIsMobileCartOpen,
    clearCart,
    getSubtotal,
    getTotalItems
  } = useCartStore();

  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    showConfirm({
      title: 'Kosongkan Pesanan?',
      message: 'Apakah Anda yakin ingin menghapus seluruh item pesanan di keranjang kasir?',
      confirmText: 'Ya, Kosongkan',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        clearCart();
      }
    });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileCartOpen && (
        <div 
          className="mobile-cart-overlay" 
          onClick={() => setIsMobileCartOpen(false)} 
        />
      )}

      {/* Main Sidebar */}
      <aside className={`cart-sidebar ${isMobileCartOpen ? 'cart-sidebar--mobile-open' : ''}`}>
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-header-top">
            <div className="cart-title">
              <ShoppingBag size={18} color="var(--accent-hover)" />
              <span>Pesanan Kasir</span>
              {totalItems > 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  ({totalItems} item)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {items.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={handleClearCart}
                  title="Kosongkan pesanan"
                >
                  <Trash2 size={13} />
                  <span>Reset</span>
                </button>
              )}

              {/* Close button on mobile */}
              <button
                type="button"
                className="cart-clear-btn"
                style={{ display: isMobileCartOpen ? 'flex' : 'none' }}
                onClick={() => setIsMobileCartOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Dine-In vs Takeaway Toggle */}
          <div className="order-type-toggle">
            <button
              type="button"
              className={`order-type-btn ${orderType === 'DINE_IN' ? 'order-type-btn--active' : ''}`}
              onClick={() => setOrderType('DINE_IN')}
            >
              <Utensils size={14} />
              <span>Dine-In</span>
            </button>
            <button
              type="button"
              className={`order-type-btn ${orderType === 'TAKEAWAY' ? 'order-type-btn--active' : ''}`}
              onClick={() => setOrderType('TAKEAWAY')}
            >
              <Package size={14} />
              <span>Takeaway</span>
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-list">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={40} strokeWidth={1.2} />
              <div>
                <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                  Keranjang Kosong
                </div>
                <div style={{ fontSize: 'var(--text-xs)' }}>
                  Sentuh kartu menu di samping untuk menambahkan item.
                </div>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-info">
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    {item.notes && (
                      <div className="cart-item-notes">{item.notes}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    onClick={() => removeItem(item.id)}
                    title="Hapus menu ini"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="cart-item-pricing">
                  <span className="cart-item-subtotal">
                    {formatRupiah(item.price * item.quantity)}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer / Checkout Trigger */}
        <div className="cart-footer">
          <div className="cart-summary-line">
            <span>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiah(subtotal)}</span>
          </div>
          <div className="cart-summary-line cart-summary-line--total">
            <span>Total Tagihan</span>
            <span style={{ color: 'var(--accent-hover)' }}>{formatRupiah(subtotal)}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={items.length === 0}
            onClick={onProceedToCheckout}
            icon={<ArrowRight size={18} />}
          >
            Bayar ({totalItems} item)
          </Button>
        </div>
      </aside>
    </>
  );
};
