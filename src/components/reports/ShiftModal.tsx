import React, { useState, useEffect } from 'react';
import { X, PlayCircle, StopCircle } from 'lucide-react';
import { shiftRepository } from '../../db';
import type { CashierShift } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import { Button } from '../common/Button';
import { useConfirmStore } from '../../store/confirmStore';
import './ShiftModal.css';

interface ShiftModalProps {
  isOpen: boolean;
  activeShift?: CashierShift;
  cashSalesTotal?: number;
  onClose: () => void;
  onShiftUpdated: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  activeShift,
  cashSalesTotal = 0,
  onClose,
  onShiftUpdated
}) => {
  const isOpening = !activeShift;

  const [cashierName, setCashierName] = useState<string>('Kasir Utama');
  const [startingCashText, setStartingCashText] = useState<string>('100000');
  const startingCash = Number(startingCashText.replace(/[^0-9]/g, '')) || 0;
  const [internalCashSales, setInternalCashSales] = useState<number>(cashSalesTotal);
  const [actualCashText, setActualCashText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const effectiveCashSales = activeShift ? internalCashSales : 0;
  const expectedCash = activeShift ? activeShift.starting_cash + effectiveCashSales : 0;
  const actualCash = Number(actualCashText.replace(/[^0-9]/g, '')) || 0;
  const difference = actualCash - expectedCash;

  useEffect(() => {
    if (isOpen) {
      if (activeShift) {
        shiftRepository.getCashSalesForShift(activeShift)
          .then((sales) => {
            setInternalCashSales(sales);
            setActualCashText(String(activeShift.starting_cash + sales));
          })
          .catch(() => {
            setInternalCashSales(cashSalesTotal);
            setActualCashText(String(activeShift.starting_cash + cashSalesTotal));
          });
      } else {
        setCashierName('Kasir Utama');
        setStartingCashText('100000');
      }
    }
  }, [isOpen, activeShift, cashSalesTotal]);

  if (!isOpen) return null;

  const handleOpenShift = async () => {
    if (!cashierName.trim()) {
      alert('Nama kasir wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await shiftRepository.openShift(cashierName, startingCash);
      onShiftUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal membuka shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;

    useConfirmStore.getState().showConfirm({
      title: 'Tutup Shift Kasir?',
      message: 'Apakah Anda yakin ingin menutup sesi shift kasir saat ini dan mengunci rekap uang fisik?',
      confirmText: 'Ya, Tutup Shift',
      cancelText: 'Batal',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await shiftRepository.closeShift(activeShift.id, actualCash);
          onShiftUpdated();
          onClose();
        } catch (err: any) {
          alert(err.message || 'Gagal menutup shift');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  return (
    <div className="shift-modal-overlay" onClick={onClose}>
      <div className="shift-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="shift-modal-header">
          <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
            {isOpening ? 'Buka Shift Kasir Baru' : 'Tutup Shift Kasir'}
          </div>
          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="shift-modal-body">
          {isOpening ? (
            /* FORM BUKA SHIFT */
            <>
              <div className="shift-input-group">
                <label className="shift-input-label">NAMA KASIR BERTUGAS</label>
                <input
                  type="text"
                  className="shift-text-input"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Nama Kasir"
                />
              </div>

              <div className="shift-input-group">
                <label className="shift-input-label">MODAL AWAL KEMBALIAN DI LACI (RP)</label>
                <input
                  type="text"
                  className="shift-text-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 'bold' }}
                  value={startingCash ? receiptService.formatRupiah(startingCash) : ''}
                  onChange={(e) => setStartingCashText(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                />
                <div className="shift-quick-buttons">
                  {[50000, 100000, 150000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="shift-quick-btn"
                      onClick={() => setStartingCashText(String(amt))}
                    >
                      {amt / 1000}rb
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* FORM TUTUP SHIFT */
            <>
              <div className="shift-info-box">
                <div className="shift-info-row">
                  <span>Kasir:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeShift.cashier_name}</span>
                </div>
                <div className="shift-info-row">
                  <span>Mulai Shift:</span>
                  <span>{new Date(activeShift.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="shift-info-row">
                  <span>Modal Awal:</span>
                  <span className="font-mono">{receiptService.formatRupiah(activeShift.starting_cash)}</span>
                </div>
                <div className="shift-info-row">
                  <span>Total Penjualan Tunai:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-hover)' }}>
                    +{receiptService.formatRupiah(effectiveCashSales)}
                  </span>
                </div>
                <div className="shift-info-row shift-info-row--highlight">
                  <span>Total Seharusnya di Laci:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-hover)' }}>
                    {receiptService.formatRupiah(expectedCash)}
                  </span>
                </div>
              </div>

              <div className="shift-input-group">
                <label className="shift-input-label">TOTAL UANG FISIK DI LACI KASIR (RP)</label>
                <input
                  type="text"
                  className="shift-text-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 'bold' }}
                  value={actualCashText}
                  onChange={(e) => setActualCashText(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                />
              </div>

              {/* Status Selisih */}
              <div className={`shift-difference-badge ${
                difference === 0 ? 'shift-difference-badge--pas' :
                difference < 0 ? 'shift-difference-badge--kurang' : 'shift-difference-badge--lebih'
              }`}>
                <span>
                  {difference === 0 ? 'Status: Kas Seimbang (Pas)' :
                   difference < 0 ? 'Status: Uang Kurang' : 'Status: Uang Lebih'}
                </span>
                <span>{receiptService.formatRupiah(difference)}</span>
              </div>
            </>
          )}
        </div>

        <div className="shift-modal-footer">
          <Button variant="ghost" size="md" onClick={onClose}>
            Batal
          </Button>

          {isOpening ? (
            <Button
              variant="primary"
              size="md"
              icon={<PlayCircle size={18} />}
              onClick={handleOpenShift}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Membuka...' : 'Buka Shift Sekarang'}
            </Button>
          ) : (
            <Button
              variant="danger"
              size="md"
              icon={<StopCircle size={18} />}
              onClick={handleCloseShift}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menutup...' : 'Tutup Shift Kasir'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
