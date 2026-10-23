import React, { useState } from 'react';
import { User, Mail, Compass, DollarSign, Database, CheckCircle2, AlertCircle, RefreshCw, LogOut, ShieldCheck, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../../lib/supabase';
import { StorageService } from '../../services/storage';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, user, signOut, isSupabaseActive } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [homeAirport, setHomeAirport] = useState(profile?.homeAirport || 'SFO');
  const [preferredCurrency, setPreferredCurrency] = useState(profile?.preferredCurrency || 'USD');
  const [travelStyle, setTravelStyle] = useState(profile?.travelStyle || 'Luxury & Cultural');

  const [language, setLanguage] = useState(profile?.language || 'English (US)');
  const [savedDestinations, setSavedDestinations] = useState<string[]>(
    profile?.savedDestinations || ['Amalfi Coast', 'Kyoto', 'Lauterbrunnen & Zermatt']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  // Supabase cloud credentials configuration
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.key);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        homeAirport: homeAirport.trim().toUpperCase(),
        preferredCurrency,
        travelStyle,
        language,
        savedDestinations,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSavedDestination = async (destName: string) => {
    const updated = savedDestinations.filter(d => d !== destName);
    setSavedDestinations(updated);
    await updateProfile({ savedDestinations: updated });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationInput !== 'DELETE') return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.hash = '#/';
      window.location.reload();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const handleTestAndSaveSupabase = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const test = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(test);
    setTestingConnection(false);

    if (test.success) {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset your itineraries to the curated sample seed trips? Any custom trips created locally will be refreshed.')) {
      StorageService.resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-2xs">
        <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
          Traveler Identity
        </span>
        <h1 className="font-editorial text-4xl font-bold text-stone-900 mt-1">
          Profile & Preferences
        </h1>
        <p className="text-stone-500 text-sm mt-1 font-light">
          Manage your personal travel journal persona, language preferences, saved wishlist destinations, and cloud database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Profile Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-stone-200 shadow-2xs space-y-6">
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Traveler Details & Preferences
          </h3>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile & preferences updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Preview & URL */}
            <div className="flex items-center gap-4 pb-2">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shadow-2xs"
              />
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || profile?.email || ''}
                className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Home Airport (IATA)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. SFO, LHR, JFK"
                  value={homeAirport}
                  onChange={(e) => setHomeAirport(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Base Currency
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Interface Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="German (Deutsch)">German (Deutsch)</option>
                  <option value="Japanese (日本語)">Japanese (日本語)</option>
                  <option value="Italian (Italiano)">Italian (Italiano)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Primary Travel Style
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury & Slow Exploration"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Traveler Biography & Philosophy
              </label>
              <textarea
                rows={3}
                placeholder="Share your travel philosophy..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Saved Destinations Wishlist */}
          <div className="pt-6 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-editorial text-xl font-bold text-stone-900">
                  Saved Destinations & Wishlist
                </h4>
                <p className="text-xs text-stone-500 font-light">
                  Destinations bookmarked for upcoming journeys.
                </p>
              </div>
              <span className="text-xs font-bold text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {savedDestinations.length} Saved
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {savedDestinations.map((dest) => (
                <div
                  key={dest}
                  className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  <span className="font-semibold text-stone-800">{dest}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        window.location.hash = '#/new-trip';
                      }}
                      className="text-[#1B4332] hover:underline font-semibold cursor-pointer"
                    >
                      Plan Trip
                    </button>
                    <button
                      onClick={() => handleRemoveSavedDestination(dest)}
                      className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Remove from saved"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Database Sync & Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cloud Database Integration Status */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-editorial text-xl font-bold text-stone-900">
                  Storage & Cloud Database
                </h4>
                <div className="text-xs text-stone-500">
                  {isSupabaseActive ? 'Connected to Supabase PostgreSQL' : 'Local Storage Engine Active'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed font-light">
              GlobeTrotter supports hybrid persistence. Trips and itineraries persist securely on your device, and can synchronize with your remote Supabase cloud project.
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestAndSaveSupabase}
                disabled={testingConnection}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>Test & Save Cloud Credentials</span>
              </button>
            </div>
          </div>

          {/* Data Reset, Sign Out & Delete Account */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h4 className="font-editorial text-lg font-bold text-stone-900">
              Account Security & Management
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResetData}
                className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left px-3.5 flex items-center justify-between"
              >
                <span>Reset to Seed Sample Itineraries</span>
                <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left px-3.5 flex items-center justify-between"
              >
                <span>Sign Out of Account</span>
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left px-3.5 flex items-center justify-between"
              >
                <span>Delete Account & Purge Data</span>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Permanently Delete Account?
              </h3>
              <p className="text-xs text-stone-500 font-light">
                This will purge all your custom itineraries, activities, expense records, and profile data from storage.
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2">
              <p className="text-stone-700 font-medium">
                To confirm deletion, please type <span className="font-mono font-bold text-rose-600">DELETE</span> below:
              </p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono uppercase"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationInput('');
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationInput !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
