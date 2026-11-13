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
  Globe, 
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
    { id: 'dashboard', label: t.navHome, icon: Sprout },
    { id: 'scanner', label: t.navScanner, icon: Scan, highlight: true },
    { id: 'report', label: t.navReport, icon: FileText, disabled: !hasActiveReport },
    { id: 'treatment', label: t.navTreatment, icon: ShieldAlert, disabled: !hasActiveReport },
    { id: 'assistant', label: t.navAssistant, icon: Mic },
    { id: 'map', label: t.navMap, icon: MapPin },
    { id: 'followup', label: t.navFollowUp, icon: CalendarCheck },
    { id: 'crops', label: t.navCropLibrary, icon: Wheat },
    { id: 'expert', label: t.navExpertPortal, icon: UserCheck }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F3822] text-white shadow-md border-b border-agri-800">
      {/* Top Advisory & Emergency Banner */}
      <div className="bg-[#092516] px-4 py-1.5 text-xs flex justify-between items-center text-agri-200 border-b border-agri-900">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          <span className="font-medium text-lime-300">
            {lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି ସତର୍କତା:' : 'Odisha Agro Alert:'}
          </span>
          <span className="truncate">
            {lang === 'or' ? 'ବରଗଡ଼ ଓ ସମ୍ବଲପୁରରେ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ସତର୍କତା' : 'High BPH hopperburn alert active in Bargarh canal irrigated belts'}
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-xs">
          <a 
            href="tel:18001801551" 
            className="flex items-center space-x-1 text-lime-300 hover:text-white transition-colors"
            title="Kisan Call Centre Toll-Free"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1800-180-1551</span>
          </a>
          <span className="text-agri-700">|</span>
          <button 
            onClick={onOpenSettings}
            className="flex items-center space-x-1 hover:text-lime-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.navSettings}</span>
          </button>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-agri-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-agri-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  {lang === 'or' ? 'କୃଷି ମିତ୍ର AI' : 'Krushi Mitra AI'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-400/30">
                  ODISHA 2026
                </span>
              </div>
              <p className="text-[11px] text-agri-200 hidden md:block">
                {lang === 'or' ? t.taglineOr : t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavClick(item.id)}
                  disabled={item.disabled}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    isActive 
                      ? 'bg-agri-800 text-lime-300 shadow-sm border border-agri-700' 
                      : item.highlight
                      ? 'bg-lime-500 text-agri-950 font-bold hover:bg-lime-400 shadow-md'
                      : item.disabled
                      ? 'text-agri-400/50 cursor-not-allowed'
                      : 'text-agri-100 hover:bg-agri-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-300' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Quick Voice + Language Toggle */}
          <div className="flex items-center space-x-2">
            {/* Quick Odia Voice Button */}
            <button
              onClick={onQuickVoice}
              className="p-2 rounded-full bg-agri-800 hover:bg-agri-700 text-lime-300 border border-agri-700 hover:scale-105 transition-all shadow"
              title={lang === 'or' ? 'ଓଡ଼ିଆ ଭଏସ୍ ସହାୟକ' : 'Odia Voice Assistant'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language Switcher Pill */}
            <div className="flex rounded-lg bg-agri-900/80 p-0.5 border border-agri-700 text-xs font-medium">
              <button
                onClick={() => setLang('or')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'or' 
                    ? 'bg-lime-500 text-agri-950 font-bold shadow' 
                    : 'text-agri-200 hover:text-white'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'en' 
                    ? 'bg-lime-500 text-agri-950 font-bold shadow' 
                    : 'text-agri-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-agri-200 hover:text-white hover:bg-agri-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-agri-900 border-t border-agri-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && handleNavClick(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                  isActive
                    ? 'bg-agri-800 text-lime-300 font-bold'
                    : item.highlight
                    ? 'bg-lime-500 text-agri-950 font-bold'
                    : item.disabled
                    ? 'text-agri-500/40 cursor-not-allowed'
                    : 'text-agri-100 hover:bg-agri-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-agri-800 flex justify-between items-center text-xs text-agri-300">
            <button 
              onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
              className="flex items-center space-x-1.5 py-1 text-lime-300"
            >
              <Settings className="w-4 h-4" />
              <span>{t.navSettings}</span>
            </button>
            <a href="tel:18001801551" className="text-agri-200">
              Kisan Helpline: 1800-180-1551
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
