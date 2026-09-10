import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Bug } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('dit_report_clean_v3');
      localStorage.removeItem('dit_active_session_id');
      localStorage.removeItem('dit_report_sessions_v1');
      localStorage.removeItem('dit_chat_messages_v3');
      localStorage.removeItem('dit_admin_users_v2');
      localStorage.removeItem('dit_admin_events_v2');
      localStorage.removeItem('dit_admin_announcement_v1');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111214] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#1a1b1e] border border-[#2d3035] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white">Hitilafu ya Kupakia Mfumo</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kuna hitilafu imetokea wakati wa kupakia ukurasa. Bonyeza kitufe hapa chini ili kuanzisha upya au kusafisha cache.
              </p>
            </div>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                <div className="text-[11px] font-mono text-red-300 break-words font-semibold">
                  {this.state.error.toString()}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Anzisha Upya (Reload)</span>
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#282a2e] hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-[#383a3f] hover:border-red-500/30 font-medium text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Safisha Cache & Reload</span>
              </button>
            </div>

            {/* Technical Stack Trace Accordion */}
            {this.state.errorInfo && (
              <div className="pt-2 text-left">
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-1 mx-auto transition"
                >
                  <Bug className="w-3 h-3" />
                  <span>{this.state.showDetails ? 'Ficha Maelezo ya Kiufundi' : 'Onyesha Maelezo ya Kiufundi'}</span>
                </button>

                {this.state.showDetails && (
                  <pre className="mt-3 p-3 rounded-xl bg-[#121315] border border-[#25272a] text-[10px] text-slate-400 overflow-x-auto max-h-48 font-mono leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
