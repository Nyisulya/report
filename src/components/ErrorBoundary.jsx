import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111214] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1e1f20] border border-[#2e2f30] rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-white">Hitilafu ya Kupakia Mfumo</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kuna hitilafu ndogo imetokea wakati wa kupakia ukurasa. Bonyeza kitufe hapa chini ili kuanzisha upya.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('dit_active_session_id');
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg"
              >
                Anzisha Upya (Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
