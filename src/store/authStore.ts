import { create } from 'zustand';
import { db } from '../db';
import type { UserSession, PinVerifyResult } from '../types/auth';

interface AuthState {
  currentSession: UserSession | null;
  isScreenLocked: boolean;

  // Actions
  initAuth: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<PinVerifyResult>;
  verifyOwnerPin: (pin: string) => Promise<boolean>;
  lockScreen: () => void;
  logout: () => void;
  changePin: (type: 'CASHIER' | 'OWNER', newPin: string) => Promise<boolean>;
  getStoredPins: () => Promise<{ cashierPin: string; ownerPin: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Default saat aplikasi dimuat: sesi Kasir aktif
  currentSession: {
    role: 'CASHIER',
    name: 'Kasir Staff',
    loginTime: new Date().toISOString()
  },
  isScreenLocked: false,

  initAuth: async () => {
    // Pastikan PIN tersimpan di IndexedDB
    const cashier = await db.settings.get('auth_cashier_pin');
    if (!cashier) {
      await db.settings.put({ key: 'auth_cashier_pin', value: '1234' });
      await db.settings.put({ key: 'auth_owner_pin', value: '8888' });
    }
  },

  unlockWithPin: async (pin: string): Promise<PinVerifyResult> => {
    const cashierSetting = await db.settings.get('auth_cashier_pin');
    const ownerSetting = await db.settings.get('auth_owner_pin');

    const cashierPin = cashierSetting?.value || '1234';
    const ownerPin = ownerSetting?.value || '8888';

    if (pin === ownerPin) {
      const session: UserSession = {
        role: 'OWNER',
        name: 'Owner / Supervisor',
        loginTime: new Date().toISOString()
      };
      set({ currentSession: session, isScreenLocked: false });
      return { success: true, role: 'OWNER' };
    }

    if (pin === cashierPin) {
      const session: UserSession = {
        role: 'CASHIER',
        name: 'Kasir Staff',
        loginTime: new Date().toISOString()
      };
      set({ currentSession: session, isScreenLocked: false });
      return { success: true, role: 'CASHIER' };
    }

    return { success: false, message: 'PIN tidak sesuai. Silakan coba lagi.' };
  },

  verifyOwnerPin: async (pin: string): Promise<boolean> => {
    const ownerSetting = await db.settings.get('auth_owner_pin');
    const ownerPin = ownerSetting?.value || '8888';
    return pin === ownerPin;
  },

  lockScreen: () => {
    set({ isScreenLocked: true });
  },

  logout: () => {
    set({ currentSession: null, isScreenLocked: true });
  },

  changePin: async (type: 'CASHIER' | 'OWNER', newPin: string): Promise<boolean> => {
    if (newPin.length !== 4) return false;
    const key = type === 'CASHIER' ? 'auth_cashier_pin' : 'auth_owner_pin';
    await db.settings.put({ key, value: newPin });
    return true;
  },

  getStoredPins: async () => {
    const cashier = await db.settings.get('auth_cashier_pin');
    const owner = await db.settings.get('auth_owner_pin');
    return {
      cashierPin: cashier?.value || '1234',
      ownerPin: owner?.value || '8888'
    };
  }
}));
