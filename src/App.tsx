import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PestScanner } from './components/PestScanner';
import { PestReport } from './components/PestReport';
import { TreatmentEngine } from './components/TreatmentEngine';
import { VoiceAssistant } from './components/VoiceAssistant';
import { DistrictMap } from './components/DistrictMap';
import { FollowUpTracker } from './components/FollowUpTracker';
import { CropLibrary } from './components/CropLibrary';
import { ExpertPortal } from './components/ExpertPortal';
import { KrushiStore } from './components/KrushiStore';
import { TalkToExpert } from './components/TalkToExpert';
import { SellerDashboard } from './components/SellerDashboard';
import { ExpertDashboard } from './components/ExpertDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { FarmerOrders } from './components/FarmerOrders';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Footer } from './components/Footer';

import { ScanReport } from './types/pest';
import { SamplePestImage, SAMPLE_PEST_IMAGES } from './data/sampleImages';
import { StorageService } from './services/storageService';
import { PestVisionService } from './services/pestVisionService';

import { 
  Sprout, 
  Scan, 
  FileText, 
  ShieldAlert, 
  Mic, 
  MapPin, 
  CalendarCheck,
  ShoppingBag,
  UserCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'or' | 'en'>('or');
  const [activeReport, setActiveReport] = useState<ScanReport | null>(null);
  const [reportsHistory, setReportsHistory] = useState<ScanReport[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<SamplePestImage | null>(null);

  // New modules state
  const [userRole, setUserRole] = useState<'farmer' | 'seller' | 'expert' | 'admin'>('farmer');
  const [storeFilterPest, setStoreFilterPest] = useState<string | undefined>(undefined);
  const [storeFilterCrop, setStoreFilterCrop] = useState<string | undefined>(undefined);

  // Load existing reports and settings from local persistence on mount
  useEffect(() => {
    const existing = StorageService.getReports();
    if (existing.length > 0) {
      setReportsHistory(existing);
      setActiveReport(existing[0]);
    } else {
      // If fresh, initialize baseline Brown Planthopper demo report so tabs are immediately fully interactive!
      PestVisionService.analyzeCropImage(SAMPLE_PEST_IMAGES[0].imageUri, 'paddy', 'bph', 'bargarh')
        .then(initialReport => {
          initialReport.isSampleScan = true;
          setActiveReport(initialReport);
          setReportsHistory([initialReport]);
          StorageService.saveReport(initialReport);
        });
    }

    const settings = StorageService.getSettings();
    if (settings.language) {
      setLang(settings.language);
    }
  }, []);

  const handleLanguageChange = (newLang: 'or' | 'en') => {
    setLang(newLang);
    StorageService.saveSettings({ language: newLang });
  };

  const handleScanComplete = (report: ScanReport) => {
    setActiveReport(report);
    setReportsHistory(prev => [report, ...prev]);
    StorageService.saveReport(report);
    setCurrentTab('report');
  };

  const handleSelectSampleFromDashboard = (sample: SamplePestImage) => {
    setSelectedSample(sample);
    setCurrentTab('scanner');
  };

  const handleFindProductsFromReport = (cropId?: string, pestId?: string) => {
    setStoreFilterCrop(cropId);
    setStoreFilterPest(pestId);
    setCurrentTab('store');
  };

  const handleDiscussWithExpert = (report: ScanReport) => {
    setActiveReport(report);
    setCurrentTab('talk_expert');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF7] text-slate-900 font-sans selection:bg-lime-200 w-full overflow-x-hidden">
      {/* Top Main Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasActiveReport={!!activeReport}
        onQuickVoice={() => setCurrentTab('assistant')}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12 overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard
            lang={lang}
            onNavigate={setCurrentTab}
            onSelectSample={handleSelectSampleFromDashboard}
            activeReport={activeReport}
            reportsHistory={reportsHistory}
          />
        )}

        {currentTab === 'scanner' && (
          <PestScanner
            lang={lang}
            onScanComplete={handleScanComplete}
            selectedSample={selectedSample}
            onClearSample={() => setSelectedSample(null)}
          />
        )}

        {currentTab === 'report' && activeReport && (
          <PestReport
            report={activeReport}
            lang={lang}
            onNavigateTreatments={() => setCurrentTab('treatment')}
            onFollowUpSchedule={() => setCurrentTab('followup')}
            onEscalate={() => setCurrentTab('talk_expert')}
            onFindProducts={handleFindProductsFromReport}
            onDiscussWithExpert={handleDiscussWithExpert}
          />
        )}

        {currentTab === 'treatment' && activeReport && (
          <TreatmentEngine
            report={activeReport}
            lang={lang}
            onNavigateAssistant={() => setCurrentTab('assistant')}
            onFollowUpSchedule={() => setCurrentTab('followup')}
          />
        )}

        {currentTab === 'assistant' && (
          <VoiceAssistant
            lang={lang}
            activeReport={activeReport}
          />
        )}

        {currentTab === 'map' && (
          <DistrictMap
            lang={lang}
          />
        )}

        {currentTab === 'followup' && (
          <FollowUpTracker
            lang={lang}
            reports={reportsHistory}
            activeReport={activeReport}
            onSelectReport={(r) => setActiveReport(r)}
          />
        )}

        {currentTab === 'crops' && (
          <CropLibrary
            lang={lang}
          />
        )}

        {/* Krushi Store (Multi-vendor Marketplace) */}
        {currentTab === 'store' && (
          <KrushiStore
            lang={lang}
            onNavigateOrders={() => setCurrentTab('my_orders')}
            onNavigateSellerPortal={() => setCurrentTab('seller_dashboard')}
            initialFilterPest={storeFilterPest}
            initialFilterCrop={storeFilterCrop}
          />
        )}

        {/* Talk to an Expert (Farmer-facing hub) */}
        {currentTab === 'talk_expert' && (
          <TalkToExpert
            lang={lang}
            activeReport={activeReport}
            onOpenReport={() => setCurrentTab('report')}
          />
        )}

        {/* Seller Dashboard */}
        {currentTab === 'seller_dashboard' && (
          <SellerDashboard
            lang={lang}
          />
        )}

        {/* Expert Dashboard */}
        {currentTab === 'expert_dashboard' && (
          <ExpertDashboard
            lang={lang}
          />
        )}

        {/* Legacy Expert Review Queue */}
        {currentTab === 'expert' && (
          <ExpertPortal
            lang={lang}
            reports={reportsHistory}
          />
        )}

        {/* Admin Dashboard */}
        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            lang={lang}
          />
        )}

        {/* My Orders History */}
        {currentTab === 'my_orders' && (
          <FarmerOrders
            lang={lang}
            onNavigateStore={() => setCurrentTab('store')}
          />
        )}
      </main>

      {/* Bottom Floating Bar for Mobile Experience */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex justify-around items-center md:hidden shadow-lg w-full">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
            currentTab === 'dashboard' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ମୁଖ୍ୟ' : 'Home'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('scanner')}
          className="min-h-[44px] flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-lime-500 text-agri-950 flex items-center justify-center shadow-lg border-2 border-white">
            <Scan className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-agri-900 mt-1">
            {lang === 'or' ? 'ସ୍କାନ୍' : 'Scan'}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('store')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
            currentTab === 'store' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ଷ୍ଟୋର' : 'Store'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('talk_expert')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
            currentTab === 'talk_expert' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ପରାମର୍ଶ' : 'Expert'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('assistant')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 text-[11px] font-bold ${
            currentTab === 'assistant' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <Mic className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ଓଡ଼ିଆ AI' : 'Odia AI'}</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        lang={lang}
        onNavigate={setCurrentTab}
      />

      {/* API Key & Configuration Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
      />
    </div>
  );
};
