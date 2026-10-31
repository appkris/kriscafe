import React, { useState, useEffect, useRef } from 'react';
import {
  Coins,
  QrCode,
  Printer,
  Send,
  CheckCircle2,
  RotateCcw,
  X
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { transactionRepository, shiftRepository } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { PaymentMethod, Transaction, TransactionItem } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import { ThermalReceipt58 } from '../receipt/ThermalReceipt58';
import { Button } from '../common/Button';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const {
    items,
    orderType,
    getSubtotal,
    clearCart
  } = useCartStore();

  const activeShift = useLiveQuery(() => shiftRepository.getCurrentOpenShift(), []);
  const total = getSubtotal();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [cashInputText, setCashInputText] = useState<string>(String(total));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Input Opsional No Meja & Nama Pemesan
  const [tableNumberInput, setTableNumberInput] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState<string>('');

  // Step 2: Transaksi Berhasil & Data Struk
  const [completedData, setCompletedData] = useState<{
    transaction: Transaction;
    items: TransactionItem[];
  } | null>(null);

  const [whatsappPhone, setWhatsappPhone] = useState<string>('');

  // Ref untuk mengunci eksekusi pembayaran agar tidak terjadi double submit / double invoice
  const isSubmittingRef = useRef<boolean>(false);

  // Inisialisasi hanya saat modal pertama dibuka
  useEffect(() => {
    if (isOpen) {
      setCashGiven(total);
      setCashInputText(String(total));
      setCompletedData(null);
      setPaymentMethod('CASH');
      setWhatsappPhone('');
      setTableNumberInput('');
      setCustomerNameInput('');
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashGiven - total);
  const isCashSufficient = cashGiven >= total;

  const handleSelectQuickCash = (amount: number) => {
    setCashGiven(amount);
    setCashInputText(String(amount));
  };

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const num = Number(rawValue) || 0;
    setCashInputText(rawValue);
    setCashGiven(num);
  };

  const handleConfirmPayment = async () => {
    // Kunci untuk mencegah double submission
    if (isSubmittingRef.current || isProcessing) return;
    if (!items || items.length === 0) return;
    if (paymentMethod === 'CASH' && !isCashSufficient) return;

    try {
      isSubmittingRef.current = true;
      setIsProcessing(true);

      const amountPaid = paymentMethod === 'CASH' ? cashGiven : total;
      const change = paymentMethod === 'CASH' ? changeDue : 0;

      const checkoutItems = items.map((i) => ({
        menuId: i.menuId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        notes: i.notes
      }));

      // Simpan atomik ke IndexedDB & potong stok
      const result = await transactionRepository.create({
        subtotal: total,
        total: total,
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        changeDue: change,
        customerName: customerNameInput.trim() || undefined,
        tableNumber: tableNumberInput.trim() || undefined,
        orderType: orderType,
        cashierName: activeShift?.cashier_name || 'Kasir Utama',
        items: checkoutItems
      });

      setCompletedData(result);
      // Kosongkan keranjang belanja kasir
      clearCart();
    } catch (err) {
      console.error('Error saat menyelesaikan pembayaran:', err);
      alert('Gagal memproses transaksi.');
    } finally {
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePrintReceipt = () => {
    receiptService.triggerPrint();
  };

  const handleSendWhatsApp = () => {
    if (!completedData) return;
    const url = receiptService.generateWhatsAppUrl(
      whatsappPhone,
      completedData.transaction,
      completedData.items
    );
    window.open(url, '_blank');
  };

  const handleFinishAndReset = () => {
    setCompletedData(null);
    onClose();
  };

  return (
    <div className="payment-modal-overlay" onClick={completedData ? handleFinishAndReset : onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="payment-modal-header">
          <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            {completedData ? 'Transaksi Selesai' : 'Pembayaran Pesanan'}
          </div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={completedData ? handleFinishAndReset : onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: INPUT PEMBAYARAN */}
        {!completedData ? (
          <>
            <div className="payment-modal-body">
              {/* Total Tagihan */}
              <div className="total-callout">
                <div>
                  <div className="total-callout-label">Total Tagihan</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {orderType} • {items.length} item
                  </div>
                </div>
                <div className="total-callout-val">
                  {receiptService.formatRupiah(total)}
                </div>
              </div>

              {/* No. Meja & Nama Pemesan Opsional */}
              <div className="payment-meta-row">
                <div className="payment-meta-col">
                  <label className="payment-label" htmlFor="inputTableNumber">
                    NO. MEJA (OPSIONAL)
                  </label>
                  <input
                    id="inputTableNumber"
                    type="text"
                    className="payment-text-input"
                    placeholder={orderType === 'DINE_IN' ? 'Contoh: Meja 05' : 'Takeaway'}
                    value={tableNumberInput}
                    onChange={(e) => setTableNumberInput(e.target.value)}
                  />
                </div>
                <div className="payment-meta-col">
                  <label className="payment-label" htmlFor="inputCustomerName">
                    NAMA PEMESAN (OPSIONAL)
                  </label>
                  <input
                    id="inputCustomerName"
                    type="text"
                    className="payment-text-input"
                    placeholder="Nama pelanggan"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Pilihan Metode: Tunai vs QRIS */}
              <div>
                <label className="payment-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  METODE PEMBAYARAN
                </label>
                <div className="method-tabs">
                  <button
                    type="button"
                    className={`method-btn ${paymentMethod === 'CASH' ? 'method-btn--active' : ''}`}
                    onClick={() => setPaymentMethod('CASH')}
                  >
                    <Coins size={18} />
                    <span>Tunai (Cash)</span>
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${paymentMethod === 'QRIS' ? 'method-btn--active' : ''}`}
                    onClick={() => setPaymentMethod('QRIS')}
                  >
                    <QrCode size={18} />
                    <span>QRIS Statis</span>
                  </button>
                </div>
              </div>

              {/* Jika Metode: Tunai */}
              {paymentMethod === 'CASH' ? (
                <>
                  <div>
                    <label className="payment-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                      NOMINAL CEPAT (QUICK CASH)
                    </label>
                    <div className="quick-cash-grid">
                      <button
                        type="button"
                        className="quick-cash-btn quick-cash-btn--pas"
                        onClick={() => handleSelectQuickCash(total)}
                      >
                        Uang Pas
                      </button>
                      <button
                        type="button"
                        className="quick-cash-btn"
                        onClick={() => handleSelectQuickCash(10000)}
                      >
                        10.000
                      </button>
                      <button
                        type="button"
                        className="quick-cash-btn"
                        onClick={() => handleSelectQuickCash(20000)}
                      >
                        20.000
                      </button>
                      <button
                        type="button"
                        className="quick-cash-btn"
                        onClick={() => handleSelectQuickCash(50000)}
                      >
                        50.000
                      </button>
                      <button
                        type="button"
                        className="quick-cash-btn"
                        onClick={() => handleSelectQuickCash(100000)}
                      >
                        100.000
                      </button>
                      <button
                        type="button"
                        className="quick-cash-btn"
                        onClick={() => {
                          const rounded = Math.ceil(total / 10000) * 10000;
                          handleSelectQuickCash(rounded);
                        }}
                      >
                        Bulatkan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="payment-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                      UANG DITERIMA DARI PEMBELI (RP)
                    </label>
                    <div className="cash-input-row">
                      <input
                        type="text"
                        className="cash-input"
                        value={cashInputText}
                        onChange={handleCashInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Banner Kembalian */}
                  <div className={`change-box ${isCashSufficient ? 'change-box--success' : 'change-box--warning'}`}>
                    <span>
                      {isCashSufficient ? 'Uang Kembalian:' : 'Uang Kurang:'}
                    </span>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>
                      {isCashSufficient
                        ? receiptService.formatRupiah(changeDue)
                        : receiptService.formatRupiah(total - cashGiven)}
                    </span>
                  </div>
                </>
              ) : (
                /* Jika Metode: QRIS */
                <div className="qris-display-box">
                  <div className="qris-badge-tag">QRIS PEMBAYARAN</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: '#4B5563' }}>
                    KrisCafe Kantin Sentral
                  </div>

                  {/* Stylized QR Code SVG Representation */}
                  <svg className="qris-svg-qr" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="24" height="24" fill="black" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="black" />
                    {/* Corner 2 */}
                    <rect x="66" y="10" width="24" height="24" fill="black" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="black" />
                    {/* Corner 3 */}
                    <rect x="10" y="66" width="24" height="24" fill="black" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="black" />
                    {/* Data dots */}
                    <rect x="40" y="15" width="6" height="6" fill="black" />
                    <rect x="52" y="15" width="6" height="6" fill="black" />
                    <rect x="42" y="30" width="8" height="8" fill="black" />
                    <rect x="55" y="40" width="8" height="8" fill="black" />
                    <rect x="25" y="45" width="6" height="6" fill="black" />
                    <rect x="40" y="65" width="8" height="8" fill="black" />
                    <rect x="65" y="55" width="10" height="10" fill="black" />
                    <rect x="55" y="75" width="8" height="8" fill="black" />
                    <rect x="75" y="75" width="12" height="12" fill="black" />
                  </svg>

                  <div style={{ fontSize: 'var(--text-xs)', color: '#1F2937', fontWeight: 600 }}>
                    Total: {receiptService.formatRupiah(total)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    Mendukung BCA, Mandiri, GoPay, OVO, ShopeePay, DANA & Bank Digital.
                  </div>
                </div>
              )}
            </div>

            <div className="payment-modal-footer">
              <Button variant="ghost" size="md" onClick={onClose}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="lg"
                id="btn-confirm-payment"
                icon={<CheckCircle2 size={18} />}
                disabled={(paymentMethod === 'CASH' && !isCashSufficient) || isProcessing}
                onClick={handleConfirmPayment}
              >
                {isProcessing ? 'Menyimpan...' : 'Konfirmasi Selesai'}
              </Button>
            </div>
          </>
        ) : (
          /* STEP 2: TRANSAKSI BERHASIL & CETAK STRUK (REDESAIN PREMIUM) */
          <>
            <div className="payment-modal-body success-modal-body">
              {/* Hero Banner: Status & Icon Animasi */}
              <div className="success-hero">
                <div className="success-hero-icon-ring">
                  <CheckCircle2 size={36} />
                </div>
                <div className="success-hero-title">Pembayaran Berhasil!</div>
                <div className="success-hero-meta">
                  <span className="success-invoice-badge">
                    {completedData.transaction.invoice_number}
                  </span>
                  <span className="success-dot-separator">•</span>
                  <span className="success-type-badge">
                    {completedData.transaction.order_type === 'DINE_IN'
                      ? (completedData.transaction.table_number
                        ? `Dine-In • ${completedData.transaction.table_number.toLowerCase().startsWith('meja') ? completedData.transaction.table_number : `Meja ${completedData.transaction.table_number}`}`
                        : 'Dine-In')
                      : 'Takeaway'}
                  </span>
                  {completedData.transaction.customer_name && (
                    <>
                      <span className="success-dot-separator">•</span>
                      <span className="success-type-badge">
                        An. {completedData.transaction.customer_name}
                      </span>
                    </>
                  )}
                  <span className="success-dot-separator">•</span>
                  <span className="success-method-badge">
                    {completedData.transaction.payment_method === 'CASH' ? 'Tunai' : 'QRIS'}
                  </span>
                </div>
              </div>

              {/* Highlight Kembalian (CASH) atau Status (QRIS) */}
              {completedData.transaction.payment_method === 'CASH' ? (
                <div className="success-change-card">
                  <div className="success-change-header">
                    <span className="success-change-label">UANG KEMBALIAN KASIR</span>
                    <span className="success-change-badge">
                      {completedData.transaction.change_due > 0 ? 'Wajib Diberikan' : 'Uang Pas'}
                    </span>
                  </div>
                  <div className="success-change-amount">
                    {receiptService.formatRupiah(completedData.transaction.change_due)}
                  </div>
                  <div className="success-change-breakdown">
                    <div className="success-breakdown-col">
                      <span>Total Belanja:</span>
                      <strong>{receiptService.formatRupiah(completedData.transaction.total)}</strong>
                    </div>
                    <div className="success-breakdown-divider" />
                    <div className="success-breakdown-col">
                      <span>Uang Diterima:</span>
                      <strong>{receiptService.formatRupiah(completedData.transaction.amount_paid)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="success-change-card success-change-card--qris">
                  <div className="success-change-header">
                    <span className="success-change-label">STATUS PEMBAYARAN QRIS</span>
                    <span className="success-change-badge success-change-badge--qris">Lunas</span>
                  </div>
                  <div className="success-change-amount" style={{ color: 'var(--status-info)' }}>
                    {receiptService.formatRupiah(completedData.transaction.total)}
                  </div>
                  <div className="success-change-breakdown">
                    <div className="success-breakdown-col">
                      <span>Metode:</span>
                      <strong>QRIS KrisCafe</strong>
                    </div>
                    <div className="success-breakdown-divider" />
                    <div className="success-breakdown-col">
                      <span>Kasir:</span>
                      <strong>{completedData.transaction.cashier_name}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Rincian Ringkas Item Terjual */}
              <div className="success-items-preview">
                <div className="success-items-header">
                  <span>Rincian Item ({completedData.items.length})</span>
                  <span>{new Date(completedData.transaction.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="success-items-list">
                  {completedData.items.map((it) => (
                    <div key={it.id} className="success-item-row">
                      <div className="success-item-name-wrap">
                        <span className="success-item-qty">{it.quantity}x</span>
                        <span className="success-item-name">{it.menu_name}</span>
                        {it.notes && <span className="success-item-notes">({it.notes})</span>}
                      </div>
                      <span className="success-item-subtotal">
                        {receiptService.formatRupiah(it.item_subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Cetak Struk Fisik & WhatsApp */}
              <div className="success-receipt-actions">
                <div className="success-action-title">Cetak atau Kirim Struk</div>

                <div className="success-action-buttons-grid">
                  <Button
                    variant="primary"
                    size="md"
                    className="btn-print-thermal"
                    icon={<Printer size={18} />}
                    onClick={handlePrintReceipt}
                  >
                    Cetak Struk
                  </Button>

                  <div className="success-whatsapp-box">
                    <div className="success-wa-input-wrap">
                      <Send size={15} className="success-wa-icon" />
                      <input
                        type="tel"
                        className="success-whatsapp-input"
                        placeholder="(0812345678)"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-send-whatsapp"
                      onClick={handleSendWhatsApp}
                      title="Kirim Struk ke WhatsApp Pelanggan"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal: Tombol Transaksi Baru yang Sangat Jelas & Ergonomis */}
            <div className="payment-modal-footer success-modal-footer">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                id="btn-finish-new-order"
                icon={<RotateCcw size={18} />}
                onClick={handleFinishAndReset}
              >
                Selesai & Transaksi Baru
              </Button>
            </div>

            {/* Template Struk Thermal 58mm (Khusus Cetak, Tersembunyi di Layar) */}
            <div className="print-only-container">
              <ThermalReceipt58
                transaction={completedData.transaction}
                items={completedData.items}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
