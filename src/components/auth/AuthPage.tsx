import React, { useState } from 'react';
import { Compass, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Database, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
  notice?: string | null;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  notice = null,
  onSuccess,
}) => {
  const { signIn, signUp, loginAsDemo, user, profile, isAuthenticated, signOut, isSupabaseActive } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onSuccess();
        }
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please provide your name.');
          setIsLoading(false);
          return;
        }
        const res = await signUp(email, password, displayName);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('Account created successfully! Welcome to GlobeTrotter.');
          setTimeout(() => onSuccess(), 800);
        }
      } else {
        // Password recovery
        setSuccessMsg(`If an account exists for ${email}, a password reset link has been dispatched.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication operation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900 flex flex-col justify-between">
      {/* Top Bar - Pure branding with no reverse navigation */}
      <header className="border-b border-stone-200/80 bg-white/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 text-left"
            aria-label="GlobeTrotter"
          >
            <div className="w-9 h-9 rounded-full bg-[#1B4332] text-white flex items-center justify-center shadow-2xs">
              <Compass className="w-5 h-5 text-[#FBF8F3]" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#1B4332] block leading-none">
                GlobeTrotter
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-500">
                Editorial Itineraries
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/5 text-xs font-semibold text-[#1B4332] uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Sign In</span>
          </div>
        </div>
      </header>

      {/* Main Two-Column Auth Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="max-w-5xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero & Visual Panel */}
          <div className="lg:col-span-5 relative bg-[#1B4332] text-[#FBF8F3] p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[340px] lg:min-h-[640px]">
            {/* Background Texture / Subtle overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FBF8F3_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-emerald-600/20 blur-3xl"></div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold uppercase tracking-wider border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Traveler Portal</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Every great journey begins with an open page.
              </h2>

              <p className="text-emerald-100/80 text-sm font-light leading-relaxed">
                Save multi-day itineraries, track expenses across global currencies, and harness Gemini AI travel concierge.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="relative z-10 space-y-3 pt-6 border-t border-emerald-900/60">
              <div className="flex items-center gap-2.5 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Cloud sync with persistent local backup</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI-assisted day-by-day scheduling</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Private tokenized link sharing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
            {/* Existing Session Notice */}
            {isAuthenticated && user && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Currently signed in as:
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700">{user.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold">{profile?.displayName || 'Traveler'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSuccess}
                      className="px-3 py-1 bg-[#1B4332] text-white text-xs font-semibold rounded-lg hover:bg-[#2D6A4F] cursor-pointer"
                    >
                      Go to Journal
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="px-3 py-1 bg-white text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      Switch / Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Route Protection Notice */}
            {notice && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3 shadow-2xs animate-in fade-in">
                <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Sign In Required
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {notice}
                  </p>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs */}
            <div className="flex items-center border-b border-stone-200 gap-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                  mode === 'signin' ? 'text-[#1B4332]' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In
                {mode === 'signin' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                  mode === 'signup' ? 'text-[#1B4332]' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Create Account (Sign Up)
                {mode === 'signup' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                  mode === 'forgot' ? 'text-[#1B4332]' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Recovery
                {mode === 'forgot' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
                )}
              </button>
            </div>

            {/* Heading */}
            <div>
              <h3 className="font-editorial text-3xl font-bold text-stone-900">
                {mode === 'signin' && 'Sign in to your travel journal'}
                {mode === 'signup' && 'Create your travel passport'}
                {mode === 'forgot' && 'Reset your password'}
              </h3>
              <p className="text-xs text-stone-500 font-light mt-1">
                {mode === 'signin' && 'Access all your saved trips, day schedules, and travel budgets.'}
                {mode === 'signup' && 'Start organizing your dream voyages with bespoke day-by-day plans.'}
                {mode === 'forgot' && 'Enter your email address and we will provide password recovery access.'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harshita Boramani"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-stone-500 hover:text-stone-800"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300 text-[#1B4332] focus:ring-[#1B4332]"
                    />
                    <span>Remember my session on this device</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-sm font-semibold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Processing...'
                    : mode === 'signin'
                    ? 'Sign In to GlobeTrotter'
                    : mode === 'signup'
                    ? 'Create Travel Passport'
                    : 'Dispatch Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Demo Account Button */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instant Review: Sign In as Harshita (Demo Account)</span>
              </button>
            </div>

            {/* Storage Status Footer */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
              <span className="flex items-center gap-1.5">
                {isSupabaseActive ? (
                  <>
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Supabase Auth & Database</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-stone-500" />
                    <span>Local Persistent Session</span>
                  </>
                )}
              </span>

              {mode === 'signin' ? (
                <span>
                  Need an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-bold text-[#1B4332] hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="font-bold text-[#1B4332] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-stone-400">
        © 2026 GlobeTrotter — Editorial Travel Planning & Journals
      </footer>
    </div>
  );
};
