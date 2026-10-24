/**
 * Kontrak & Definisi Tipe Pondasi Cloud Sync Multi-Device
 * Digunakan sebagai acuan masa depan (Phase 7) sesuai docs/CLOUD_SYNC_ROADMAP.md
 */

export type SyncState = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR' | 'OFFLINE';

export type DeviceIdentifier = 'KASIR-01' | 'KASIR-02' | 'ADMIN-OWNER' | string;

export interface DeviceConfig {
  deviceId: DeviceIdentifier;
  deviceName: string;
  isCloudSyncEnabled: boolean;
  cloudEndpoint?: string;
  apiKey?: string;
}

export interface SyncSummary {
  pendingTransactionsCount: number;
  lastSyncedAt: string | null;
  syncState: SyncState;
  isOnline: boolean;
  errorMessage?: string;
}

export interface SyncEngineContract {
  getDeviceConfig(): Promise<DeviceConfig>;
  getSyncSummary(): Promise<SyncSummary>;
  pushPendingTransactions(): Promise<{ success: boolean; pushedCount: number }>;
  pullMenuUpdates(): Promise<{ success: boolean; updatedCount: number }>;
}
