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

  const handleResetPassword = async () => {
    const email = window.prompt("अपना ईमेल एड्रेस दर्ज करें (Enter your email address to reset password):", emailInput);
    if (!email) return;
    if (!email.trim()) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      await supabaseService.resetPassword(email.trim());
      setEmailSuccess(`Password reset email has been sent to ${email}. Please check your inbox!`);
    } catch (err: any) {
      setEmailError(err.message || "Failed to send password reset email.");
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
        {/* Brand Action-like Button */}
        <button
          type="button"
          className="w-full bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 hover:text-white py-3.5 px-4 rounded-xl transition-all font-black uppercase tracking-widest cursor-pointer mb-5 flex items-center justify-center gap-3.5"
          style={{ 
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`
          }}
        >
          {/* Left Gothwad Logo Box */}
          <div className="w-8 h-8 rounded-lg bg-[#0494f4] flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
            <img 
              src="/icon-512-maskable.png" 
              alt="Gothwad Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="font-black tracking-widest text-zinc-100 text-[13px] sm:text-[15px]">
            GOTHWAD AI STUDIO
          </span>

          {/* Right GitHub Logo Box */}
          <div className="w-8 h-8 rounded-lg bg-[#0494f4] flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
            <Github className="w-4.5 h-4.5 text-white" />
          </div>
        </button>

        {/* Auth Switcher Tabs */}
        <div className="w-full flex gap-3 select-none mb-5 max-w-md">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setEmailError(null);
              setEmailSuccess(null);
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              !isSignUp 
                ? "text-white shadow-md font-extrabold" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
            }`}
            style={!isSignUp ? { backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}25` } : {}}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setEmailError(null);
              setEmailSuccess(null);
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isSignUp 
                ? "text-white shadow-md font-extrabold" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
            }`}
            style={isSignUp ? { backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}25` } : {}}
          >
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
            {(() => {
              const isFormValid = emailInput.trim() !== "" && passwordInput.trim() !== "" && passwordInput.length >= 6;
              return (
                <button 
                  type="submit"
                  disabled={emailLoading || !isFormValid}
                  className={`w-full py-4 rounded-xl transition-all disabled:opacity-75 active:scale-[0.98] mt-2 cursor-pointer flex items-center justify-center font-black uppercase tracking-widest text-[11px] sm:text-xs ${
                    isFormValid
                      ? "text-white" 
                      : "text-zinc-500 bg-zinc-900 border border-zinc-800/60"
                  }`}
                  style={isFormValid ? { 
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 12px ${accentColor}25`
                  } : {}}
                >
                  {emailLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span>{isSignUp ? "SIGN UP" : "SIGN IN"}</span>
                  )}
                </button>
              );
            })()}

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

        {/* Forgot Password Button */}
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={emailLoading}
          className="w-full bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-white py-3.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest cursor-pointer mt-6 flex items-center justify-center gap-2"
          style={{ 
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`
          }}
        >
          <span>forget password ?</span>
        </button>

        {/* Extra bottom spacer to match spacing */}
        <div className="h-12 w-full shrink-0" />

      </div>
    </div>
  );
}
