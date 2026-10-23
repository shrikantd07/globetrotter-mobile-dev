import React, { useState } from 'react';
import { Compass, Calendar, MapPin, Sparkles, User, LogOut, Menu, X, Plus, ShieldCheck, Database, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, tripId?: string) => void;
  onOpenCreateTrip: () => void;
  onOpenAiPlanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateTrip,
  onOpenAiPlanner,
}) => {
  const { user, profile, isAuthenticated, signOut, loginAsDemo, isSupabaseActive } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Journal', icon: Compass },
    { id: 'trips', label: 'My Trips', icon: MapPin },
    { id: 'destinations', label: 'Destinations', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 text-left group transition-all"
              aria-label="GlobeTrotter Homepage"
            >
              <div className="w-10 h-10 rounded-full bg-[#1B4332] flex items-center justify-center text-[#FBF8F3] shadow-sm group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-[#FBF8F3]" />
              </div>
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#1B4332] block leading-none">
                  GlobeTrotter
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-stone-500">
                  Editorial Itineraries
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#1B4332]/10 text-[#1B4332] font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1B4332]' : 'text-stone-400'}`} />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Travel Planner Trigger */}
            <button
              onClick={onOpenAiPlanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Co-Pilot</span>
            </button>

            {/* Create Trip Button */}
            <button
              onClick={onOpenCreateTrip}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </button>

            {/* Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-stone-200/60 transition-colors border border-stone-200"
                  aria-expanded={showProfileMenu}
                  aria-label="User Profile Menu"
                >
                  <img
                    src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={profile?.displayName || 'Traveler'}
                    className="w-8 h-8 rounded-full object-cover border border-white"
                  />
                  <span className="text-xs font-medium text-stone-700 pr-1 max-w-[100px] truncate">
                    {profile?.displayName?.split(' ')[0] || 'Traveler'}
                  </span>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {profile?.displayName || 'Traveler'}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                        {isSupabaseActive ? (
                          <>
                            <Database className="w-3 h-3 text-emerald-600" />
                            <span>Cloud Sync Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 text-stone-500" />
                            <span>Local Persistent Sync</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Profile & Cloud Sync
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('trips');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-stone-400" />
                      All Itineraries
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('login');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-stone-400" />
                      Sign In / Switch Accounts
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                        onNavigate('login');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs px-3.5 py-2 text-stone-700 hover:text-stone-900 font-semibold hover:bg-stone-200/50 rounded-lg cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="text-xs px-3.5 py-2 bg-[#1B4332] text-white rounded-lg font-semibold hover:bg-[#2D6A4F] shadow-2xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenCreateTrip}
              className="p-2 rounded-lg bg-[#1B4332] text-white"
              aria-label="Create Trip"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/60"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FBF8F3] px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-[#1B4332] text-white' : 'text-stone-700 bg-white border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onOpenAiPlanner();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              AI Travel Co-Pilot
            </button>

            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-sm font-medium"
            >
              <User className="w-4 h-4 text-stone-500" />
              Profile & Cloud Database
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                  onNavigate('landing');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-rose-700 text-xs font-medium"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#1B4332] text-white rounded-lg text-sm font-medium"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
