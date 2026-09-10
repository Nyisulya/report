import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

export default function InstallAppPrompt({ onManualTriggerRef }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed)
    const isRunningStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    
    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Listen for native beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Auto show modal/banner on first visit if not dismissed within 24h
      const dismissedTime = localStorage.getItem('report_ai_install_dismissed');
      const now = Date.now();
      if (!dismissedTime || (now - parseInt(dismissedTime, 10)) > 24 * 60 * 60 * 1000) {
        // Wait 3 seconds after page load for smooth UX
        setTimeout(() => {
          setIsOpen(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and first visit, prompt after 4 seconds
    if (isIosDevice && !isRunningStandalone) {
      const dismissedTime = localStorage.getItem('report_ai_install_dismissed');
      const now = Date.now();
      if (!dismissedTime || (now - parseInt(dismissedTime, 10)) > 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          setIsOpen(true);
        }, 4000);
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
      localStorage.setItem('report_ai_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, the modal provides visual instructions
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('report_ai_install_dismissed', Date.now().toString());
  };

  // If already installed as app, don't show prompt
  if (isStandalone || !isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 p-4 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#181a20]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl p-5 text-slate-100 ring-1 ring-amber-500/20">
        
        {/* Header with App Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
              <img 
                src="/favicon.svg" 
                alt="Field Report AI" 
                className="w-10 h-10 rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="font-bold text-sm text-slate-100">
                  Field Report AI
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sakinisha kwenye simu au kompyuta yako
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#252830] transition"
            title="Funga"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value Proposition */}
        <div className="my-3.5 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Inafanya kazi bila kufungua browser kila mara</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Inaokoa bando & inapakia ripoti papo hapo</span>
          </div>
        </div>

        {/* iOS vs Android/Desktop Actions */}
        {isIOS ? (
          <div className="p-3 rounded-xl bg-[#222630] border border-[#2f3542] text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-amber-300 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Jinsi ya kusakinisha kwenye iPhone/iPad:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>
                Gusa kitufe cha <strong className="text-white">Kushiriki (Share <Share className="w-3 h-3 inline text-blue-400" />)</strong> chini ya Safari
              </li>
              <li>
                Tembeza chini kisha chagua <strong className="text-white">"Add to Home Screen (Weka kwenye Skrini ya Mwanzo <PlusSquare className="w-3 h-3 inline text-amber-400" />)"</strong>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-2 rounded-xl bg-[#2e3442] hover:bg-[#3b4355] text-slate-200 text-xs font-semibold transition"
            >
              Nimeelewa
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2.5 pt-1">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl bg-[#252830] hover:bg-[#2d313c] text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Baadaye
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/25 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Sakinisha Sasa</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
