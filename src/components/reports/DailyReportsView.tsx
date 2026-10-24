import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Coins, 
  QrCode, 
  Flame, 
  Clock, 
  Printer, 
  PlayCircle, 
  StopCircle,
  X
} from 'lucide-react';
import { transactionRepository, shiftRepository } from '../../db';
import type { DailySummary, Transaction, TransactionItem, CashierShift } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ThermalReceipt58 } from '../receipt/ThermalReceipt58';
import { ShiftModal } from './ShiftModal';
import './DailyReportsView.css';

export const DailyReportsView: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentShift, setCurrentShift] = useState<CashierShift | undefined>(undefined);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

  // Modal Cetak Ulang Struk
  const [reprintModalData, setReprintModalData] = useState<{
    transaction: Transaction;
    items: TransactionItem[];
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [sum, recents, shift] = await Promise.all([
        transactionRepository.getDailySummary(),
        transactionRepository.getRecent(20),
        shiftRepository.getCurrentOpenShift()
      ]);
      setSummary(sum);
      setTransactions(recents);
      setCurrentShift(shift);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReprint = async (transactionId: string) => {
    const data = await transactionRepository.getByIdWithItems(transactionId);
    if (data) {
      setReprintModalData(data);
    }
  };

  return (
    <div className="reports-view-container">
      {/* 4 Kartu Metrik Utama */}
      <div className="reports-metrics-grid">
        <div className="metric-card">
          <div className="metric-card-label">
            <TrendingUp size={16} color="var(--accent-hover)" />
            <span>Total Omzet Hari Ini</span>
          </div>
          <div className="metric-card-val metric-card-val--accent">
            {receiptService.formatRupiah(summary?.totalRevenue || 0)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">
            <Receipt size={16} />
            <span>Jumlah Transaksi</span>
          </div>
          <div className="metric-card-val">
            {summary?.totalTransactions || 0} Trx
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">
            <Coins size={16} color="var(--status-success)" />
            <span>Pendapatan Tunai</span>
          </div>
          <div className="metric-card-val" style={{ color: 'var(--status-success)' }}>
            {receiptService.formatRupiah(summary?.totalCash || 0)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">
            <QrCode size={16} color="var(--status-info)" />
            <span>Pendapatan QRIS</span>
          </div>
          <div className="metric-card-val" style={{ color: 'var(--status-info)' }}>
            {receiptService.formatRupiah(summary?.totalQris || 0)}
          </div>
        </div>
      </div>

      {/* 2-Kolom: Status Shift Kasir & Menu Terlaris */}
      <div className="reports-two-col">
        {/* Card Shift Kasir */}
        <Card elevated>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)' }}>
              <Clock size={18} color="var(--accent-hover)" />
              <span>Sesi Shift Kasir</span>
            </div>
            {currentShift ? (
              <Badge variant="success">Shift Aktif</Badge>
            ) : (
              <Badge variant="warning">Belum Ada Shift</Badge>
            )}
          </div>

          {currentShift ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <div>Kasir Bertugas: <strong style={{ color: 'var(--text-primary)' }}>{currentShift.cashier_name}</strong></div>
              <div>Mulai: {new Date(currentShift.start_time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
              <div>Modal Awal: <strong className="font-mono">{receiptService.formatRupiah(currentShift.starting_cash)}</strong></div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <Button
                  variant="danger"
                  size="md"
                  icon={<StopCircle size={16} />}
                  onClick={() => setIsShiftModalOpen(true)}
                >
                  Tutup Shift Kasir
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Buka shift kasir untuk mencatat modal kembalian awal di laci kas dan memantau uang fisik saat toko tutup.
              </p>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlayCircle size={16} />}
                  onClick={() => setIsShiftModalOpen(true)}
                >
                  Buka Shift Kasir Baru
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 5 Menu Terlaris */}
        <Card elevated>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)' }}>
            <Flame size={18} color="var(--accent-hover)" />
            <span>5 Menu Terlaris Hari Ini</span>
          </div>

          <div className="best-seller-list">
            {summary?.topSellingItems && summary.topSellingItems.length > 0 ? (
              summary.topSellingItems.map((item, idx) => (
                <div key={item.menu_id} className="best-seller-item">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="best-seller-rank">#{idx + 1}</div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {item.menu_name}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)' }}>
                      {item.quantity} porsi
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {receiptService.formatRupiah(item.revenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>
                Belum ada transaksi penjualan hari ini.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Riwayat Transaksi Terakhir */}
      <div className="transaction-list-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Receipt size={18} color="var(--accent-hover)" />
            <span>Riwayat Transaksi Penjualan ({transactions.length})</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Segarkan
          </Button>
        </div>

        {transactions.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: 'var(--space-6) 0', textAlign: 'center' }}>
            Belum ada riwayat transaksi yang tercatat di database lokal.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Waktu</th>
                  <th>Tipe Pesanan</th>
                  <th>Metode</th>
                  <th>Total Tagihan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>
                      {t.invoice_number}
                    </td>
                    <td>
                      {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Badge variant="default">
                        {t.order_type === 'DINE_IN' ? `Meja ${t.table_number || '-'}` : 'Takeaway'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={t.payment_method === 'CASH' ? 'success' : 'accent'}>
                        {t.payment_method}
                      </Badge>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>
                      {receiptService.formatRupiah(t.total)}
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Printer size={13} />}
                        onClick={() => handleOpenReprint(t.id)}
                      >
                        Cetak Struk
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Shift */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        activeShift={currentShift}
        cashSalesTotal={summary?.totalCash || 0}
        onClose={() => setIsShiftModalOpen(false)}
        onShiftUpdated={loadData}
      />

      {/* Modal Cetak Ulang Struk */}
      {reprintModalData && (
        <div className="shift-modal-overlay" onClick={() => setReprintModalData(null)}>
          <div className="shift-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shift-modal-header">
              <span style={{ fontWeight: 'bold' }}>Cetak Ulang Struk Transaksi</span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setReprintModalData(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="shift-modal-body">
              <ThermalReceipt58
                transaction={reprintModalData.transaction}
                items={reprintModalData.items}
              />
            </div>
            <div className="shift-modal-footer">
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={<Printer size={16} />}
                onClick={() => receiptService.triggerPrint()}
              >
                Cetak Struk Thermal Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
