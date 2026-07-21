export interface SecurityConfig {
  pinLockEnabled: boolean;
  pinCode: string;
  biometricReady: boolean;
  securityScore: number;
}

const STORAGE_KEY = 'pocketpilot_security_config';

export const securityService = {
  getConfig(): SecurityConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading security config:', e);
    }
    return {
      pinLockEnabled: false,
      pinCode: '',
      biometricReady: true,
      securityScore: 95,
    };
  },

  saveConfig(config: SecurityConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed saving security config:', e);
    }
  }
};
