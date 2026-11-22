import { ScanReport, FollowUpScan } from '../types/pest';

const STORAGE_KEYS = {
  REPORTS: 'krushi_mitra_reports_v1',
  API_KEY: 'krushi_mitra_gemini_api_key',
  SETTINGS: 'krushi_mitra_settings',
  EXPERT_QUEUE: 'krushi_mitra_expert_queue'
};

export interface AppSettings {
  language: 'or' | 'en';
  preferredDistrict: string;
  useLiveGemini: boolean;
  selectedModel: 'gemini-3.5-flash' | 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-2.5-flash';
  useBackendProxy: boolean;
  backendUrl: string;
}

export const PRODUCTION_BACKEND_URL = 'https://krushi-mitra-ai-production.up.railway.app/api/v1';

const KNOWN_PLACEHOLDER_SUBSTRINGS = [
  'your-railway',
  'railway-domain',
  'your-domain',
  'your-krushi-mitra',
  'your-api',
  'your-service',
  'your-backend',
  '<your-',
  'placeholder',
  'example.com',
  'onrender.com',
  'undefined',
  'null'
];

export const isPlaceholderBackendUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  if (trimmed.includes('<') || trimmed.includes('>')) return true;
  return KNOWN_PLACEHOLDER_SUBSTRINGS.some(pattern => trimmed.includes(pattern));
};

export const normalizeBackendUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || isPlaceholderBackendUrl(url)) {
    return PRODUCTION_BACKEND_URL;
  }
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned || isPlaceholderBackendUrl(cleaned)) {
    return PRODUCTION_BACKEND_URL;
  }

  // Ensure protocol is present
  if (!/^https?:\/\//i.test(cleaned)) {
    if (/^(localhost|127\.0\.0\.1)(:\d+)?/i.test(cleaned)) {
      cleaned = `http://${cleaned}`;
    } else {
      cleaned = `https://${cleaned}`;
    }
  }

  // Structure and hostname validation
  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();

    // Catch unresolvable single-label non-localhost hostnames like "your-railway-domain"
    if (host !== 'localhost' && !host.includes('.')) {
      return PRODUCTION_BACKEND_URL;
    }
    if (isPlaceholderBackendUrl(host)) {
      return PRODUCTION_BACKEND_URL;
    }

    // In production deployments (e.g. Vercel / non-local hostnames), override any localhost/127.0.0.1
    if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (host === 'localhost' || host === '127.0.0.1') {
        return PRODUCTION_BACKEND_URL;
      }
    }

    // Ensure clean /api/v1 pathing
    let pathname = parsed.pathname.replace(/\/+$/, '');
    if (!pathname.endsWith('/api/v1')) {
      if (pathname.endsWith('/api')) {
        pathname = `${pathname}/v1`;
      } else if (pathname === '' || pathname === '/') {
        pathname = '/api/v1';
      } else {
        pathname = `${pathname}/api/v1`;
      }
    }

    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    return PRODUCTION_BACKEND_URL;
  }
};

const getInitialBackendUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    const envUrl = String(import.meta.env.VITE_API_URL).trim();
    if (envUrl.length > 0 && !isPlaceholderBackendUrl(envUrl)) {
      return normalizeBackendUrl(envUrl);
    }
  }
  return PRODUCTION_BACKEND_URL;
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'or',
  preferredDistrict: 'bargarh',
  useLiveGemini: true,
  selectedModel: 'gemini-3.5-flash',
  useBackendProxy: true,
  backendUrl: getInitialBackendUrl()
};

export class StorageService {
  public static getSettings(): AppSettings {
    const defaultBackendUrl = getInitialBackendUrl();
    const effectiveDefaults: AppSettings = {
      ...DEFAULT_SETTINGS,
      backendUrl: defaultBackendUrl
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const resolvedBackendUrl = normalizeBackendUrl(parsed.backendUrl || defaultBackendUrl);
        // Self-heal localStorage if stored backendUrl was invalid or a placeholder
        if (parsed.backendUrl !== resolvedBackendUrl) {
          parsed.backendUrl = resolvedBackendUrl;
          try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...effectiveDefaults, ...parsed, backendUrl: resolvedBackendUrl }));
          } catch {
            // ignore localStorage quota errors
          }
        }
        return { ...effectiveDefaults, ...parsed, backendUrl: resolvedBackendUrl };
      }
      return effectiveDefaults;
    } catch {
      return effectiveDefaults;
    }
  }

  public static saveSettings(settings: Partial<AppSettings>): void {
    try {
      const current = this.getSettings();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  public static getApiKey(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
      if (stored && stored.trim()) return stored.trim();
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim()) return envKey.trim();
      return '';
    } catch {
      return '';
    }
  }

  public static saveApiKey(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  }

  public static getReports(): ScanReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveReport(report: ScanReport): void {
    try {
      let reports = this.getReports();
      const existingIdx = reports.findIndex(r => r.id === report.id);
      if (existingIdx >= 0) {
        reports[existingIdx] = report;
      } else {
        reports.unshift(report);
      }
      try {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      } catch (quotaError) {
        console.warn('Storage quota exceeded, pruning historical reports to keep latest 10...', quotaError);
        reports = reports.slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      }
    } catch (e) {
      console.error('Failed to save report', e);
    }
  }

  public static addFollowUp(reportId: string, followUp: FollowUpScan): void {
    try {
      const reports = this.getReports();
      const report = reports.find(r => r.id === reportId);
      if (report) {
        if (!report.followUpScans) report.followUpScans = [];
        report.followUpScans.push(followUp);
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      }
    } catch (e) {
      console.error('Failed to add follow up', e);
    }
  }

  public static escalateToExpert(reportId: string, farmerDistrict: string, notes?: string): void {
    try {
      const queue = this.getExpertQueue();
      if (!queue.find(item => item.reportId === reportId)) {
        queue.unshift({
          reportId,
          farmerDistrict,
          notes: notes || 'Farmer escalated for KVK scientific confirmation.',
          timestamp: Date.now(),
          status: 'pending_review'
        });
        localStorage.setItem(STORAGE_KEYS.EXPERT_QUEUE, JSON.stringify(queue));
      }

      // Also mark on the report itself
      const reports = this.getReports();
      const report = reports.find(r => r.id === reportId);
      if (report) {
        report.expertReviewRequired = true;
        this.saveReport(report);
      }
    } catch (e) {
      console.error('Failed to escalate to expert queue', e);
    }
  }

  public static getExpertQueue(): Array<{
    reportId: string;
    farmerDistrict: string;
    notes: string;
    timestamp: number;
    status: 'pending_review' | 'confirmed' | 'rejected';
    expertFeedback?: string;
  }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPERT_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static reviewExpertItem(
    reportId: string,
    status: 'confirmed' | 'rejected',
    expertFeedback: string
  ): void {
    try {
      const queue = this.getExpertQueue();
      const item = queue.find(q => q.reportId === reportId);
      if (item) {
        item.status = status;
        item.expertFeedback = expertFeedback;
        localStorage.setItem(STORAGE_KEYS.EXPERT_QUEUE, JSON.stringify(queue));
      }
    } catch (e) {
      console.error('Failed to update expert item', e);
    }
  }
}
