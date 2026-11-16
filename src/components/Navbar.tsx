import React, { useState } from 'react';
import { 
  Sprout, 
  Scan, 
  FileText, 
  ShieldAlert, 
  Mic, 
  MapPin, 
  CalendarCheck, 
  Settings, 
  Menu, 
  X, 
  Volume2, 
  PhoneCall,
  UserCheck,
  Wheat
} from 'lucide-react';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: 'or' | 'en';
  setLang: (lang: 'or' | 'en') => void;
  onOpenSettings: () => void;
  hasActiveReport: boolean;
  onQuickVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  onOpenSettings,
  hasActiveReport,
  onQuickVoice
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = ODIA_TRANSLATIONS[lang];

  const navItems = [
    { id: 'dashboard', label: t.navHome, shortLabel: lang === 'or' ? 'ମୁଖ୍ୟ' : 'Home', icon: Sprout },
    { id: 'scanner', label: t.navScanner, shortLabel: lang === 'or' ? 'ସ୍କାନର' : 'Scanner', icon: Scan, highlight: true },
    { id: 'report', label: t.navReport, shortLabel: lang === 'or' ? 'ରିପୋର୍ଟ' : 'Report', icon: FileText, disabled: !hasActiveReport },
    { id: 'treatment', label: t.navTreatment, shortLabel: lang === 'or' ? 'ଉପଚାର' : 'Treatment', icon: ShieldAlert, disabled: !hasActiveReport },
    { id: 'assistant', label: t.navAssistant, shortLabel: lang === 'or' ? 'ଭଏସ୍' : 'Voice', icon: Mic },
    { id: 'map', label: t.navMap, shortLabel: lang === 'or' ? 'ମାନଚିତ୍ର' : 'Map', icon: MapPin },
    { id: 'followup', label: t.navFollowUp, shortLabel: lang === 'or' ? 'ଯାଞ୍ଚ' : 'Follow-Up', icon: CalendarCheck },
    { id: 'crops', label: t.navCropLibrary, shortLabel: lang === 'or' ? 'ଫସଲ' : 'Crops', icon: Wheat },
    { id: 'expert', label: t.navExpertPortal, shortLabel: lang === 'or' ? 'ବିଶେଷଜ୍ଞ' : 'Expert', icon: UserCheck }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F3822] text-white shadow-md border-b border-agri-800 w-full overflow-hidden">
      {/* Top Advisory & Emergency Banner */}
      <div className="bg-[#092516] px-3 sm:px-4 py-1.5 text-xs flex justify-between items-center text-agri-200 border-b border-agri-900 w-full">
        <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
          <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse flex-shrink-0"></span>
          <span className="font-semibold text-lime-300 flex-shrink-0">
            {lang === 'or' ? 'କୃଷି ସତର୍କତା:' : 'Agro Alert:'}
          </span>
          <span className="truncate text-agri-200 text-[11px] sm:text-xs">
            {lang === 'or' ? 'ବରଗଡ଼ ଓ ସମ୍ବଲପୁରରେ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ସତର୍କତା' : 'High BPH hopperburn alert active in Bargarh canal irrigated belts'}
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-xs flex-shrink-0 ml-3">
          <a 
            href="tel:18001801551" 
            className="flex items-center space-x-1 text-lime-300 hover:text-white transition-colors"
            title="Kisan Call Centre Toll-Free"
          >
            <PhoneCall className="w-3.5 h-3.5 flex-shrink-0" />
            <span>1800-180-1551</span>
          </a>
          <span className="text-agri-700">|</span>
          <button 
            onClick={onOpenSettings}
            className="flex items-center space-x-1 hover:text-lime-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t.navSettings}</span>
          </button>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-between min-w-0 w-full box-border py-1.5 xl:py-0 min-h-[56px] sm:min-h-[64px]">
          {/* Logo & Brand Name */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-lime-400 to-agri-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-agri-950" />
            </div>
            <div className="flex flex-col justify-center flex-shrink-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-xl font-extrabold tracking-tight text-white font-sans whitespace-nowrap">
                  {lang === 'or' ? 'କୃଷି ମିତ୍ର AI' : 'Krushi Mitra AI'}
                </span>
                <span className="hidden sm:inline-flex xl:hidden 2xl:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-400/30 whitespace-nowrap flex-shrink-0">
                  ODISHA 2026
                </span>
              </div>
              <p className="text-[11px] text-agri-200 hidden 2xl:block whitespace-nowrap">
                {lang === 'or' ? t.taglineOr : t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center flex-auto min-w-0 justify-center gap-[2px] xl:gap-1 mx-auto xl:mx-2 order-3 xl:order-2 w-full xl:w-auto mt-1.5 xl:mt-0 py-1 xl:py-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavClick(item.id)}
                  disabled={item.disabled}
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg text-[9px] md:text-[9.2px] lg:text-[10px] xl:text-[10.5px] 2xl:text-xs font-medium transition-all flex items-center gap-0.5 xl:gap-1 whitespace-nowrap flex-shrink-0 ${
                    isActive 
                      ? 'bg-agri-800 text-lime-300 shadow-sm border border-agri-700' 
                      : item.highlight
                      ? 'bg-lime-500 text-agri-950 font-bold hover:bg-lime-400 shadow-md'
                      : item.disabled
                      ? 'text-agri-400/50 cursor-not-allowed'
                      : 'text-agri-100 hover:bg-agri-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`hidden 2xl:inline-block w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-lime-300' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Quick Voice + Language Toggle + Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 order-2 xl:order-3">
            {/* Quick Odia Voice Button (Desktop & Tablet only; mobile has prominent voice button in bottom bar) */}
            <button
              onClick={onQuickVoice}
              className="hidden sm:flex xl:hidden 2xl:flex p-2 rounded-full bg-agri-800 hover:bg-agri-700 text-lime-300 border border-agri-700 hover:scale-105 transition-all shadow items-center justify-center"
              title={lang === 'or' ? 'ଓଡ଼ିଆ ଭଏସ୍ ସହାୟକ' : 'Odia Voice Assistant'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language Switcher Pill */}
            <div className="flex rounded-lg bg-agri-900/80 p-0.5 border border-agri-700 text-xs font-medium">
              <button
                onClick={() => setLang('or')}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-md transition-all ${
                  lang === 'or' 
                    ? 'bg-lime-500 text-agri-950 font-bold shadow' 
                    : 'text-agri-200 hover:text-white'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-md transition-all ${
                  lang === 'en' 
                    ? 'bg-lime-500 text-agri-950 font-bold shadow' 
                    : 'text-agri-200 hover:text-white'
                }`}
              >
                <span className="inline sm:hidden">EN</span>
                <span className="hidden sm:inline">English</span>
              </button>
            </div>

            {/* Mobile Menu Hamburger (touch target strictly >= 44x44px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] rounded-lg text-agri-200 hover:text-white hover:bg-agri-800 flex items-center justify-center transition-colors"
              aria-label="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-agri-900 border-t border-agri-800 px-4 pt-3 pb-6 space-y-1 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && handleNavClick(item.id)}
                disabled={item.disabled}
                className={`w-full min-h-[44px] flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-agri-800 text-lime-300 font-bold'
                    : item.highlight
                    ? 'bg-lime-500 text-agri-950 font-bold'
                    : item.disabled
                    ? 'text-agri-500/40 cursor-not-allowed'
                    : 'text-agri-100 hover:bg-agri-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-agri-800 flex justify-between items-center text-xs text-agri-300">
            <button 
              onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
              className="min-h-[44px] flex items-center space-x-1.5 py-1 text-lime-300"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>{t.navSettings}</span>
            </button>
            <a href="tel:18001801551" className="min-h-[44px] flex items-center text-agri-200">
              Kisan Helpline: 1800-180-1551
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
