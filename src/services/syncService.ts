import { db } from '../db';
import type { DeviceConfig, SyncSummary, SyncEngineContract } from '../types/sync';

/**
 * SyncService (Pondasi Cloud Sync Masa Depan)
 * Sesuai arahan: tidak mengeksekusi koneksi cloud sekarang,
 * hanya menyediakan kontrak dasar yang aman dan offline-ready.
 */
class SyncService implements SyncEngineContract {
  async getDeviceConfig(): Promise<DeviceConfig> {
    const savedId = await db.settings.get('device_id');
    const savedName = await db.settings.get('device_name');

    return {
      deviceId: savedId?.value || 'KASIR-01',
      deviceName: savedName?.value || 'Kasir Utama',
      isCloudSyncEnabled: false // Dinonaktifkan hingga Phase 7 dieksekusi
    };
  }

  async getSyncSummary(): Promise<SyncSummary> {
    // Hitung jumlah transaksi lokal yang belum di-push
    const pendingCount = await db.transactions
      .filter((t) => !t.synced_to_server)
      .count();

    const lastSyncSetting = await db.settings.get('last_sync_timestamp');

    return {
      pendingTransactionsCount: pendingCount,
      lastSyncedAt: lastSyncSetting?.value || null,
      syncState: 'IDLE',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  }

  async pushPendingTransactions(): Promise<{ success: boolean; pushedCount: number }> {
    // Stub: Siap diintegrasikan ke Supabase/Cloud API di masa depan
    return { success: true, pushedCount: 0 };
  }

  async pullMenuUpdates(): Promise<{ success: boolean; updatedCount: number }> {
    // Stub: Siap diintegrasikan ke Supabase/Cloud API di masa depan
    return { success: true, updatedCount: 0 };
  }
}

export const syncService = new SyncService();
