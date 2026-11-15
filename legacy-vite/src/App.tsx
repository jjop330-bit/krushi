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
  CalendarCheck 
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'or' | 'en'>('or');
  const [activeReport, setActiveReport] = useState<ScanReport | null>(null);
  const [reportsHistory, setReportsHistory] = useState<ScanReport[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<SamplePestImage | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF7] text-slate-900 font-sans selection:bg-lime-200">
      {/* Top Main Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasActiveReport={!!activeReport}
        onQuickVoice={() => setCurrentTab('assistant')}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
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
            onEscalate={() => setCurrentTab('expert')}
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

        {currentTab === 'expert' && (
          <ExpertPortal
            lang={lang}
            reports={reportsHistory}
          />
        )}
      </main>

      {/* Bottom Floating Bar for Mobile Experience */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex justify-around items-center md:hidden shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 text-[11px] font-bold ${
            currentTab === 'dashboard' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ମୁଖ୍ୟ' : 'Home'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('scanner')}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-lime-500 text-agri-950 flex items-center justify-center shadow-lg border-2 border-white">
            <Scan className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-agri-900 mt-1">
            {lang === 'or' ? 'ସ୍କାନ୍' : 'Scan'}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab(activeReport ? 'report' : 'crops')}
          className={`flex flex-col items-center py-1 text-[11px] font-bold ${
            currentTab === 'report' || currentTab === 'treatment' ? 'text-agri-800' : 'text-slate-400'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-0.5" />
          <span>{lang === 'or' ? 'ଉପଚାର' : 'Treatments'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('assistant')}
          className={`flex flex-col items-center py-1 text-[11px] font-bold ${
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
