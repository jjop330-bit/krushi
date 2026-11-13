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
  selectedModel: 'gemini-1.5-flash' | 'gemini-2.0-flash';
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'or',
  preferredDistrict: 'bargarh',
  useLiveGemini: false,
  selectedModel: 'gemini-1.5-flash'
};

export class StorageService {
  public static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
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
      return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
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
      const reports = this.getReports();
      const existingIdx = reports.findIndex(r => r.id === report.id);
      if (existingIdx >= 0) {
        reports[existingIdx] = report;
      } else {
        reports.unshift(report);
      }
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
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
