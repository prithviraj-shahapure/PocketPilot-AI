import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Compass } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PocketPilot AI ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mb-4 shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">PocketPilot AI Recovery Cockpit</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            An unexpected error occurred in the client state. Your financial ledger data remains safely encrypted and persisted.
          </p>

          {this.state.error && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-red-300 font-mono max-w-lg overflow-x-auto">
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReload}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reload Cockpit Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
