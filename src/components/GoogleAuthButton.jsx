import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { LogOut, CheckCircle2, ChevronDown, Sparkles, Key, Mail, Loader2 } from 'lucide-react';
import { 
  getStoredGoogleUser, 
  saveGoogleUser, 
  removeGoogleUser, 
  getGoogleClientId, 
  saveGoogleClientId 
} from '../services/googleAuth';

// Authentic Google Multicolor SVG Icon
export function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

/**
 * Inner Button that uses useGoogleLogin to launch official Google OAuth popup
 */
function RealGoogleLoginButton({ onLoginSuccess, className }) {
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch official user profile from Google UserInfo API
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });

        if (!res.ok) {
          throw new Error(`Google UserInfo error: ${res.status}`);
        }

        const profile = await res.json();
        const userData = {
          name: profile.name || 'Google User',
          email: profile.email || '',
          picture: profile.picture || '',
          sub: profile.sub || '',
          verified: profile.email_verified || true,
          loginMethod: 'google_official_oauth'
        };

        saveGoogleUser(userData);
        if (onLoginSuccess) onLoginSuccess(userData);
      } catch (err) {
        console.error('Error fetching Google profile:', err);
        alert('Hitilafu katika kupata taarifa za Google: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Sign In Error:', errorResponse);
      const detail = errorResponse?.error_description || errorResponse?.error || '';
      alert('Google Sign-In haikufanikiwa: ' + (detail || 'Tafadhali kagua akaunti yako na ujaribu tena.'));
    }
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isLoading}
      className={className || "px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center space-x-2 shadow-sm transition active:scale-95 border border-slate-200"}
      title="Fungua Google Sign-In rasmi"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
      ) : (
        <GoogleIcon className="w-4 h-4" />
      )}
      <span>{isLoading ? 'Inaingia...' : 'Login with Google'}</span>
    </button>
  );
}

export function GoogleSignInButton({ onLoginSuccess, className }) {
  const activeClientId = getGoogleClientId();
  return (
    <GoogleOAuthProvider clientId={activeClientId}>
      <RealGoogleLoginButton onLoginSuccess={onLoginSuccess} className={className} />
    </GoogleOAuthProvider>
  );
}

export default function GoogleAuthButton({
  user,
  onLogin,
  onLogout,
  onSyncProfile
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => getGoogleClientId());
  const [activeClientId, setActiveClientId] = useState(() => getGoogleClientId());
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    saveGoogleClientId(clientIdInput);
    setActiveClientId(clientIdInput.trim());
    setShowConfigModal(false);
    alert('Google Client ID imehifadhiwa vizuri!');
  };

  // If user is already logged in, show user pill with avatar and dropdown menu
  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#282828] hover:bg-[#323232] border border-[#3e3e3e] hover:border-amber-500/50 transition-all text-xs text-slate-200 group"
          title={`Google Account: ${user.name} (${user.email})`}
        >
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
              }}
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {user.name?.charAt(0) || 'G'}
            </div>
          )}
          <span className="font-semibold text-slate-200 max-w-[100px] truncate hidden sm:inline">
            {user.name.split(' ')[0]}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Verified" />
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1c1c1c] border border-[#333333] shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Account Header */}
            <div className="flex items-center space-x-3 p-2 rounded-xl bg-[#242424] border border-[#2e2e2e]">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0">
                  {user.name?.charAt(0) || 'G'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono flex items-center space-x-1">
                  <Mail className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Google Verified</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1">
              {onSyncProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncProfile(user);
                    setIsOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#252525] hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent text-left text-xs text-slate-200 hover:text-amber-300 font-medium flex items-center space-x-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Weka jina hili kwenye Ripoti</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  removeGoogleUser();
                  if (onLogout) onLogout();
                  setIsOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-left text-xs text-red-400 font-medium flex items-center space-x-2 transition"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Ondoka (Sign Out)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not logged in: Render real Google OAuth Button wrapped in GoogleOAuthProvider
  return (
    <>
      <div className="flex items-center space-x-1.5">
        <GoogleOAuthProvider clientId={activeClientId}>
          <RealGoogleLoginButton onLoginSuccess={onLogin} />
        </GoogleOAuthProvider>

        {/* Config button */}
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#282828] transition"
          title="Google OAuth Settings"
        >
          <Key className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Google Client ID Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#181818] border border-[#333333] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-[#282828]">
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Google OAuth Client ID</h3>
                <p className="text-xs text-slate-400">Mipangilio ya Google Sign In</p>
              </div>
            </div>

            <form onSubmit={handleSaveClientId} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Client ID:
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="k.m. 1234567890-xxx.apps.googleusercontent.com"
                  className="w-full p-2.5 rounded-xl bg-[#111111] border border-[#383838] text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-slate-300 font-semibold text-xs transition"
                >
                  Funga
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Hifadhi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
