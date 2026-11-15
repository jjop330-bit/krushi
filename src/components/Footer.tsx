import React from 'react';
import { Sprout, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';

interface FooterProps {
  lang: 'or' | 'en';
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate
}) => {
  const t = ODIA_TRANSLATIONS[lang];

  return (
    <footer className="bg-[#092516] text-agri-100 border-t border-agri-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center text-agri-950 font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                {lang === 'or' ? 'କୃଷି ମିତ୍ର AI' : 'Krushi Mitra AI'}
              </span>
            </div>
            <p className="text-xs text-agri-200/80 max-w-sm leading-relaxed">
              {lang === 'or' ? t.taglineOr : t.tagline}
            </p>
            <p className="text-xs text-agri-300/70 max-w-md pt-2">
              {t.disclaimerText}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400">
              {lang === 'or' ? 'ମୁଖ୍ୟ ମଡ୍ୟୁଲ୍' : 'Core Modules'}
            </h4>
            <ul className="space-y-1.5 text-xs text-agri-200">
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white">{t.navHome}</button></li>
              <li><button onClick={() => onNavigate('scanner')} className="hover:text-white">{t.navScanner}</button></li>
              <li><button onClick={() => onNavigate('assistant')} className="hover:text-white">{t.navAssistant}</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white">{t.navMap}</button></li>
              <li><button onClick={() => onNavigate('followup')} className="hover:text-white">{t.navFollowUp}</button></li>
              <li><button onClick={() => onNavigate('crops')} className="hover:text-white">{t.navCropLibrary}</button></li>
            </ul>
          </div>

          {/* Emergency Helplines & KVK */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400">
              {lang === 'or' ? 'କୃଷି ସହାୟତା ହେଲ୍ପଲାଇନ୍' : 'Emergency Helplines'}
            </h4>
            <div className="space-y-2 text-xs text-agri-200">
              <div className="bg-agri-900/60 p-3 rounded-2xl border border-agri-800">
                <div className="flex items-center space-x-1.5 text-lime-300 font-bold">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Kisan Call Centre (KCC)</span>
                </div>
                <a href="tel:18001801551" className="text-base font-extrabold text-white mt-0.5 block hover:text-lime-300">
                  1800-180-1551
                </a>
                <span className="text-[10px] text-agri-300 block">Toll-free daily (6 AM - 10 PM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-agri-900 text-center text-xs text-agri-400/80 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Odisha AI Hackathon 2026 • AI-Powered Agricultural Pest Intelligence Platform</span>
          <span>Crafted for Odisha Farmers with Respect &amp; Scientific Integrity</span>
        </div>
      </div>
    </footer>
  );
};
