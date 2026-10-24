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
import { Button } from '../common/Button';
import './CartSidebar.css';

interface CartSidebarProps {
  onProceedToCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    orderType,
    tableNumber,
    customerName,
    isMobileCartOpen,
    removeItem,
    updateQuantity,
    setOrderType,
    setTableNumber,
    setCustomerName,
    setIsMobileCartOpen,
    clearCart,
    getSubtotal,
    getTotalItems
  } = useCartStore();

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
    if (confirm('Kosongkan seluruh keranjang pesanan?')) {
      clearCart();
    }
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

          {/* Table Number or Customer Name Input */}
          <div className="order-meta-row">
            {orderType === 'DINE_IN' ? (
              <input
                type="text"
                className="order-meta-input"
                placeholder="No. Meja (misal: 05)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="order-meta-input"
                placeholder="Nama Pemesan (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            )}
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
                    title="Hapus item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-counter">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Kurangi"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Tambah"
                      disabled={!item.isUnlimitedStock && item.quantity >= item.stock}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="cart-item-subtotal">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        <div className="cart-footer">
          <div className="summary-line">
            <span>Subtotal ({totalItems} item)</span>
            <span className="font-mono">{formatRupiah(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Diskon / Pajak</span>
            <span className="font-mono">Rp 0</span>
          </div>
          <div className="summary-line summary-line--total">
            <span>TOTAL</span>
            <span className="total-amount">{formatRupiah(subtotal)}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
            disabled={items.length === 0}
            onClick={onProceedToCheckout}
          >
            Lanjut Bayar • {formatRupiah(subtotal)}
          </Button>
        </div>
      </aside>

      {/* Floating Trigger Bar on Mobile */}
      {items.length > 0 && !isMobileCartOpen && (
        <div className="mobile-cart-trigger">
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {totalItems} item ({orderType})
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-bold)', color: 'var(--accent-hover)', fontSize: 'var(--text-lg)' }}>
              {formatRupiah(subtotal)}
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<ShoppingBag size={18} />}
            onClick={() => setIsMobileCartOpen(true)}
          >
            Lihat Pesanan
          </Button>
        </div>
      )}
    </>
  );
};
