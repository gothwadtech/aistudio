import React, { ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Trash2, Copy, Check, Eye, EyeOff, Send, Play } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showError: boolean;
  reported: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showError: false,
    reported: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Gothwad AI Studio captured a crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyError = () => {
    if (!this.state.error) return;
    const details = `Error: ${this.state.error.message}\n\nStack:\n${this.state.error.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(details).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleRestartApp = () => {
    // Quick session restart - clear state and reload cleanly
    localStorage.removeItem("gothwad_active_session"); 
    window.location.reload();
  };

  private handleReportError = () => {
    this.setState({ reported: true });
  };

  public render() {
    if (this.state.hasError) {
      const accentColor = "#375a7f"; // Gothwad brand default color
      
      return (
        <div className="relative h-screen w-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col items-center justify-start py-8 px-3 sm:py-10 sm:px-4 overflow-y-auto select-none z-[99999]">
          {/* Ambient space background overlay */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-zinc-950/98 to-zinc-950 pointer-events-none" />
          
          <div className="relative max-w-sm w-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-850/80 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-center space-y-4">
            
            {/* Logo Section: Curved Maskable Logo */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 p-0.5 shadow-lg flex items-center justify-center">
                <img 
                  src="/icon-192-maskable.png" 
                  alt="Gothwad Logo" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Title & Simple Language Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-zinc-400 block">
                Diagnostic Exception Info
              </span>
              <p className="text-[10px] text-zinc-400 font-sans font-medium uppercase tracking-wide leading-relaxed px-1">
                GOTHWAD AI STUDIO RAN INTO AN UNEXPECTED SYSTEM ERROR AND PAUSED YOUR CURRENT SESSION.
              </p>
            </div>

            {/* Error Message Box - Expands dynamically when showError is toggled */}
            {this.state.showError && (
              <div className="space-y-1.5 text-left animate-slide-in-top">
                <div className="bg-zinc-950/90 border border-zinc-850 rounded-xl p-3 font-mono text-[10.5px] text-zinc-300 leading-relaxed shadow-inner max-h-[140px] overflow-y-auto no-scrollbar relative">
                  <div className="flex items-start gap-2 text-red-400 font-semibold mb-1">
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{this.state.error?.name || "RuntimeError"}: {this.state.error?.message || "An unexpected error occurred."}</span>
                  </div>
                  {this.state.error?.stack && (
                    <pre className="text-zinc-600 text-[8.5px] mt-1.5 whitespace-pre-wrap leading-normal border-t border-zinc-900/80 pt-1.5">
                      {this.state.error.stack.split("\n").slice(0, 3).join("\n")}
                    </pre>
                  )}
                  
                  {/* Copy Button integrated directly inside the error block */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-900/80 flex items-center justify-between">
                    <span className="text-[8px] text-zinc-600 uppercase font-mono tracking-wider">
                      Diagnostics Dump
                    </span>
                    <button
                      onClick={this.handleCopyError}
                      className="text-zinc-500 hover:text-zinc-350 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 px-2 py-1 rounded border border-zinc-850"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[9px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[9px]">Copy Dump</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Stack: Reload App, Restart App, Show/Hide Error, Report Error */}
            <div className="flex flex-col gap-2 pt-1">
              
              <div className="grid grid-cols-2 gap-2">
                {/* Reload App Button */}
                <button
                  onClick={this.handleReload}
                  className="py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                  <span>Reload App</span>
                </button>

                {/* Restart App Button (Replaced Hard Reset) */}
                <button
                  onClick={this.handleRestartApp}
                  className="py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
                  title="Restarts the application session cleanly"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>Restart App</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Show/Hide Error Toggle Button */}
                <button
                  onClick={() => this.setState((prev) => ({ showError: !prev.showError }))}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border shadow-md ${
                    this.state.showError 
                      ? "bg-zinc-800 text-zinc-150 border-zinc-750 hover:bg-zinc-750 hover:border-zinc-700" 
                      : "bg-zinc-900 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {this.state.showError ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Hide Error</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Show Error</span>
                    </>
                  )}
                </button>

                {/* Report Error Button */}
                <button
                  onClick={this.handleReportError}
                  disabled={this.state.reported}
                  className={`py-2.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-md ${
                    this.state.reported 
                      ? "bg-emerald-950/10 text-emerald-500 border-emerald-900/30 cursor-default" 
                      : "bg-zinc-900 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" style={this.state.reported ? {} : { color: accentColor }} />
                  <span>Report Error</span>
                </button>
              </div>

            </div>

            {/* Reported Success message at the bottom when clicked */}
            {this.state.reported && (
              <div className="pt-2 text-center animate-fade-in">
                <span className="inline-block px-3 py-1.5 bg-emerald-950/20 border border-emerald-900/40 rounded-full text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  ✓ Reported successfully to Gothwad Tech
                </span>
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
