import { db } from '../kriscafe-db';
import type { CashierShift } from '../../types/database';

export const shiftRepository = {
  async getCurrentOpenShift(): Promise<CashierShift | undefined> {
    return await db.cashier_shifts
      .where('status')
      .equals('OPEN')
      .first();
  },

  async openShift(cashierName: string, startingCash: number): Promise<CashierShift> {
    const existing = await this.getCurrentOpenShift();
    if (existing) {
      throw new Error(`Shift masih aktif atas nama kasir: ${existing.cashier_name}`);
    }

    const shiftId = `shift-${Date.now()}`;
    const newShift: CashierShift = {
      id: shiftId,
      cashier_name: cashierName,
      start_time: new Date().toISOString(),
      starting_cash: startingCash,
      status: 'OPEN'
    };

    await db.cashier_shifts.add(newShift);
    return newShift;
  },

  async closeShift(shiftId: string, actualCash: number): Promise<CashierShift> {
    const shift = await db.cashier_shifts.get(shiftId);
    if (!shift || shift.status !== 'OPEN') {
      throw new Error('Shift tidak ditemukan atau sudah ditutup');
    }

    // Hitung seluruh penjualan tunai yang terjadi sejak shift dibuka
    const cashTransactions = await db.transactions
      .where('created_at')
      .aboveOrEqual(shift.start_time)
      .filter(t => t.payment_method === 'CASH' && t.status === 'COMPLETED')
      .toArray();

    const totalCashSales = cashTransactions.reduce((acc, t) => acc + t.total, 0);
    const expectedCash = shift.starting_cash + totalCashSales;
    const difference = actualCash - expectedCash;
    const endTime = new Date().toISOString();

    const updatedShift: CashierShift = {
      ...shift,
      end_time: endTime,
      expected_cash: expectedCash,
      actual_cash: actualCash,
      cash_difference: difference,
      status: 'CLOSED'
    };

    await db.cashier_shifts.put(updatedShift);
    return updatedShift;
  }
};
