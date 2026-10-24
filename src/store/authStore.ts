import { create } from 'zustand';
import { db } from '../db';
import type { UserRole, UserSession, PinVerifyResult } from '../types/auth';

const STORAGE_SESSION_KEY = 'kriscafe_active_session';

interface AuthState {
  currentSession: UserSession | null;
  isScreenLocked: boolean;

  // Actions
  initAuth: () => Promise<void>;
  loginWithPin: (pin: string, preferredRole?: UserRole) => Promise<PinVerifyResult>;
  unlockWithPin: (pin: string) => Promise<PinVerifyResult>;
  verifyAdminPin: (pin: string) => Promise<boolean>;
  lockScreen: () => void;
  logout: () => void;
  changePin: (type: 'CASHIER' | 'ADMIN', newPin: string) => Promise<boolean>;
  getStoredPins: () => Promise<{ cashierPin: string; adminPin: string }>;
}

function getSavedSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'CASHIER' || parsed.role === 'ADMIN')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentSession: getSavedSession(),
  isScreenLocked: false,

  initAuth: async () => {
    // Pastikan PIN tersimpan di IndexedDB
    const cashier = await db.settings.get('auth_cashier_pin');
    if (!cashier) {
      await db.settings.put({ key: 'auth_cashier_pin', value: '1234' });
    }

    const admin = await db.settings.get('auth_admin_pin');
    if (!admin) {
      const oldOwner = await db.settings.get('auth_owner_pin');
      await db.settings.put({ key: 'auth_admin_pin', value: oldOwner?.value || '8888' });
    }
  },

  loginWithPin: async (pin: string, preferredRole?: UserRole): Promise<PinVerifyResult> => {
    const pins = await get().getStoredPins();

    // Mode preferensi Role tertentu
    if (preferredRole === 'CASHIER') {
      if (pin === pins.cashierPin) {
        const session: UserSession = {
          role: 'CASHIER',
          name: 'Kasir Staff',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        set({ currentSession: session, isScreenLocked: false });
        return { success: true, role: 'CASHIER' };
      }
      return { success: false, message: 'PIN Kasir tidak sesuai (Default: 1234)' };
    }

    if (preferredRole === 'ADMIN') {
      if (pin === pins.adminPin) {
        const session: UserSession = {
          role: 'ADMIN',
          name: 'Administrator',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        set({ currentSession: session, isScreenLocked: false });
        return { success: true, role: 'ADMIN' };
      }
      return { success: false, message: 'PIN Admin tidak sesuai (Default: 8888)' };
    }

    // Mode Otomatis (Smart PIN detection)
    if (pin === pins.adminPin) {
      const session: UserSession = {
        role: 'ADMIN',
        name: 'Administrator',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      set({ currentSession: session, isScreenLocked: false });
      return { success: true, role: 'ADMIN' };
    }

    if (pin === pins.cashierPin) {
      const session: UserSession = {
        role: 'CASHIER',
        name: 'Kasir Staff',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      set({ currentSession: session, isScreenLocked: false });
      return { success: true, role: 'CASHIER' };
    }

    return { success: false, message: 'PIN tidak terdaftar. Periksa kembali PIN Anda.' };
  },

  unlockWithPin: async (pin: string): Promise<PinVerifyResult> => {
    const pins = await get().getStoredPins();
    const current = get().currentSession;

    // Admin PIN selalu dapat membuka kunci
    if (pin === pins.adminPin) {
      set({ isScreenLocked: false });
      return { success: true, role: 'ADMIN' };
    }

    // Jika sedang dalam sesi Kasir dan PIN Kasir cocok
    if (current?.role === 'CASHIER' && pin === pins.cashierPin) {
      set({ isScreenLocked: false });
      return { success: true, role: 'CASHIER' };
    }

    // Jika belum login atau sesi baru
    if (pin === pins.cashierPin) {
      set({ isScreenLocked: false });
      return { success: true, role: 'CASHIER' };
    }

    return { success: false, message: 'PIN pembuka kunci tidak sesuai.' };
  },

  verifyAdminPin: async (pin: string): Promise<boolean> => {
    const pins = await get().getStoredPins();
    return pin === pins.adminPin;
  },

  lockScreen: () => {
    set({ isScreenLocked: true });
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
      console.warn('Could not clear local session storage', e);
    }
    set({ currentSession: null, isScreenLocked: false });
  },

  changePin: async (type: 'CASHIER' | 'ADMIN', newPin: string): Promise<boolean> => {
    if (newPin.length !== 4) return false;
    const key = type === 'CASHIER' ? 'auth_cashier_pin' : 'auth_admin_pin';
    await db.settings.put({ key, value: newPin });
    return true;
  },

  getStoredPins: async () => {
    const cashier = await db.settings.get('auth_cashier_pin');
    let admin = await db.settings.get('auth_admin_pin');
    if (!admin) {
      admin = await db.settings.get('auth_owner_pin');
    }
    return {
      cashierPin: cashier?.value || '1234',
      adminPin: admin?.value || '8888'
    };
  }
}));
