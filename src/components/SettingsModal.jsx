import React, { useState } from 'react';
import { X, Key, Cpu, Sparkles, CheckCircle2, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { getGoogleClientId, saveGoogleClientId } from '../services/googleAuth';
import { GoogleIcon } from './GoogleAuthButton';

const AI_MODELS = [
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash (deepseek-v4-flash)',
    provider: 'DeepSeek AI',
    badge: 'Default • Ultra Fast',
    desc: 'High-speed conversational engine optimized for live document generation and instant structuring.'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3 (deepseek-chat)',
    provider: 'DeepSeek AI',
    badge: 'Flagship Academic',
    desc: 'Flagship model for high-density academic reports, engineering specifications, and formal standard formatting.'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1 (deepseek-reasoner)',
    provider: 'DeepSeek AI',
    badge: 'Deep Reasoning',
    desc: 'Advanced reasoning engine for complex engineering calculations, technical friction, and standards validation.'
  }
];

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [model, setModel] = useState(selectedModel || 'deepseek-chat');
  const [clientId, setClientId] = useState(() => getGoogleClientId());
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(tempKey.trim());
    onSelectModel(model);
    saveGoogleClientId(clientId);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e2e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                AI Engine & DeepSeek API Settings
              </h3>
              <p className="text-xs text-slate-400">
                Inaendeshwa na <strong>DeepSeek AI Engine</strong> kwa ripoti za kiwango cha juu cha kihandisi.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>DeepSeek API Key</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Active Key Loaded
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Ingiza DeepSeek API key yako hapa au weka kwenye faili la .env (VITE_DEEPSEEK_API_KEY).
            </p>
          </div>

          {/* Google OAuth Client ID */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google OAuth Client ID</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                Google Sign-In
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="k.m. 1234567890-xxx.apps.googleusercontent.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#333333] text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Google Client ID ya mradi wako kutoka Google Cloud Console, au weka kwenye .env.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chagua Model ya AI</span>
            </label>
            <div className="space-y-2">
              {AI_MODELS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setModel(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    model === item.id
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-[#121212] border-[#292929] hover:border-[#383838] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.provider}
                      </span>
                    </div>
                    {model === item.id ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <span className="font-semibold">DeepSeek Anti-AI & Academic Rigor Mode: Imewashwa (Active)</span>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Misamiati yote ya AI (delve, pivotal, seamless, n.k.) inachujwa na kuondolewa ili ripoti iwe 100% authentic.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#222222] transition"
            >
              Funga
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{isSaved ? 'Imehifadhiwa!' : 'Hifadhi Mipangilio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
