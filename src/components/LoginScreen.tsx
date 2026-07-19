import React, { useState } from "react";
import { Github, AlertCircle, Loader2, ShieldCheck, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { supabaseService } from "../services/supabase";

interface LoginScreenProps {
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerSupabaseOAuth: () => void;
  onTriggerOAuth?: () => void;
  authConfig?: { clientId: string; appUrl: string } | null;
  accentColor: string;
}

export default function LoginScreen({
  isLoading,
  error,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerSupabaseOAuth,
  onTriggerOAuth,
  authConfig,
  accentColor
}: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Email state variables
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const sbConfigured = supabaseService.isConfigured();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setEmailError("Please fill in both fields.");
      return;
    }
    
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      if (isSignUp) {
        await supabaseService.signUpWithEmail(emailInput.trim(), passwordInput.trim());
        setEmailSuccess("Verification email sent! Please check your mailbox, verify your account, and then sign in.");
      } else {
        await supabaseService.signInWithEmail(emailInput.trim(), passwordInput.trim());
        setEmailSuccess("Authorized! Loading studio workspace...");
      }
    } catch (err: any) {
      setEmailError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex flex-col items-center relative overflow-y-auto select-none font-sans py-12 px-4">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: accentColor }}
      />

      <div className="w-full z-10 flex flex-col items-center max-w-md mx-auto">
        
        {/* Header Card (Matching GrixChat style) */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center mb-5 shadow-sm">
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl shadow-inner flex items-center justify-center border border-zinc-800 p-0 overflow-hidden mb-3 relative">
            <Github className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-[26px] font-black text-white tracking-tight">Gothwad AI Studio</h2>
        </div>

        {/* Auth Switcher Tabs (Matching GrixChat switcher) */}
        <div className="w-full flex p-1 gap-2 select-none mb-5 max-w-md bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setEmailError(null);
              setEmailSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              !isSignUp 
                ? "text-white shadow-md" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
            style={!isSignUp ? { backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}25` } : {}}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setEmailError(null);
              setEmailSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSignUp 
                ? "text-white shadow-md" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
            style={isSignUp ? { backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}25` } : {}}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Global Errors Display */}
        {(error || emailError) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-4 bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold text-rose-400">Authentication Failed</p>
              <p className="text-[11px] font-mono text-rose-300/80 leading-normal mt-0.5">{error || emailError}</p>
            </div>
          </motion.div>
        )}

        {/* Global Success Display */}
        {emailSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-4 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl flex items-start gap-3"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold text-emerald-400">Authorized</p>
              <p className="text-[11px] font-mono text-emerald-300/80 leading-normal mt-0.5">{emailSuccess}</p>
            </div>
          </motion.div>
        )}

        {/* MAIN CONTROLS */}
        <div className="w-full">
          
          <form 
            onSubmit={handleEmailSubmit}
            className="space-y-4 w-full"
          >
            {/* Email Input */}
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input 
                type="email" 
                placeholder="Email Address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-12 pr-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800/40 focus:border-zinc-75 transition-all placeholder:text-zinc-600 text-white"
                required
                disabled={emailLoading}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800/40 focus:border-zinc-75 transition-all placeholder:text-zinc-600 text-white"
                required
                disabled={emailLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Primary Submit Button */}
            <button 
              type="submit"
              disabled={emailLoading || !emailInput.trim() || !passwordInput.trim() || passwordInput.length < 6}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 active:scale-[0.98] shadow-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: sbConfigured ? accentColor : "#27272a",
                boxShadow: sbConfigured ? `0 4px 12px ${accentColor}20` : "none"
              }}
            >
              {emailLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Sign In / Sign Up</span>
            </button>

            {/* Separator */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
              <span className="text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-widest">or</span>
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
            </div>

            <div className="space-y-3 w-full">
              {/* Button 1: Sign In & Connect with GitHub */}
              <button
                type="button"
                onClick={onTriggerSupabaseOAuth}
                disabled={isLoading || !sbConfigured}
                className="w-full text-white text-[13px] font-bold py-3.5 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98] border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Github className="w-4 h-4" />
                )}
                <span>Sign In / Sign Up & Connect with GitHub</span>
              </button>
            </div>

          </form>

        </div>

        {/* Footer Brand Card (Exact GrixChat style mapped to Gothwad AI Studio) */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center mt-6 shadow-sm select-none gap-3.5">
          <p className="text-xs text-zinc-400/80 leading-relaxed max-w-[280px] mx-auto">
            If you forget your password, you can <a href="mailto:support@gothwadtechnologies.com?subject=Gothwad%20AI%20Studio%20Password%20Reset" className="font-bold hover:underline" style={{ color: accentColor }}>reset it here</a>. For any other assistance, please <a href="mailto:support@gothwadtechnologies.com" className="font-bold hover:underline" style={{ color: accentColor }}>contact us</a>.
          </p>
          <div className="w-full h-[1px] bg-zinc-800/60"></div>
          <div className="text-center max-w-[280px] mx-auto">
            <span className="text-xs font-semibold text-zinc-500 block leading-relaxed">
              By using <a href="https://aistudio.gothwadtech.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline cursor-pointer" style={{ color: accentColor }}>Gothwad AI Studio</a>, you agree to our <span className="font-bold hover:underline cursor-pointer" style={{ color: accentColor }}>Terms of Service</span> & <span className="font-bold hover:underline cursor-pointer" style={{ color: accentColor }}>Privacy Policy</span>.
            </span>
          </div>
        </div>

        {/* Extra bottom spacer to match spacing */}
        <div className="h-12 w-full shrink-0" />

      </div>
    </div>
  );
}
