import React from 'react';
import type { Transaction, TransactionItem } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import './ThermalReceipt58.css';

interface ThermalReceiptProps {
  transaction: Transaction;
  items: TransactionItem[];
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export const ThermalReceipt58: React.FC<ThermalReceiptProps> = ({
  transaction,
  items,
  storeName = 'KRISCAFE',
  storeAddress = 'Kantin Sentral Lt. 1 Blok B-08',
  storePhone = '081234567890'
}) => {
  const formattedDate = new Date(transaction.created_at).toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  return (
    <div id="thermal-receipt-print-area" className="thermal-receipt-container">
      {/* Header Struk */}
      <div className="receipt-header">
        <div className="receipt-store-title">{storeName}</div>
        <div className="receipt-store-sub">{storeAddress}</div>
        <div className="receipt-store-sub">Telp: {storePhone}</div>
      </div>

      <hr className="receipt-divider" />

      {/* Info Transaksi */}
      <div className="receipt-meta-row">
        <span>Invoice:</span>
        <span style={{ fontWeight: 700 }}>{transaction.invoice_number}</span>
      </div>
      <div className="receipt-meta-row">
        <span>Waktu:</span>
        <span>{formattedDate}</span>
      </div>
      <div className="receipt-meta-row">
        <span>Kasir:</span>
        <span>{transaction.cashier_name}</span>
      </div>
      <div className="receipt-meta-row">
        <span>Tipe:</span>
        <span>
          {transaction.order_type === 'DINE_IN' 
            ? `Dine-In (Meja ${transaction.table_number || '-'})` 
            : 'Takeaway'}
        </span>
      </div>

      <hr className="receipt-divider" />

      {/* Rincian Item */}
      <div className="receipt-items-table">
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 6 }}>
            <div className="receipt-item-title-row">
              <span>{item.quantity}x {item.menu_name}</span>
              <span>{receiptService.formatRupiah(item.item_subtotal)}</span>
            </div>
            {item.notes && (
              <div className="receipt-item-notes">↳ {item.notes}</div>
            )}
          </div>
        ))}
      </div>

      <hr className="receipt-divider" />

      {/* Rangkuman Pembayaran */}
      <div className="receipt-summary-row receipt-summary-total">
        <span>TOTAL</span>
        <span>{receiptService.formatRupiah(transaction.total)}</span>
      </div>
      <div className="receipt-summary-row">
        <span>Bayar ({transaction.payment_method})</span>
        <span>{receiptService.formatRupiah(transaction.amount_paid)}</span>
      </div>
      <div className="receipt-summary-row" style={{ fontWeight: 700 }}>
        <span>KEMBALIAN</span>
        <span>{receiptService.formatRupiah(transaction.change_due)}</span>
      </div>

      <hr className="receipt-divider" />

      {/* Footer */}
      <div className="receipt-footer-text">
        <div>Terima kasih atas kunjungannya!</div>
        <div style={{ marginTop: 2 }}>Selamat menikmati hidangan kami.</div>
      </div>
    </div>
  );
};
