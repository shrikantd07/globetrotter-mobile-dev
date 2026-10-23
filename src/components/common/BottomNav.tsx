import React from 'react';
import { Compass, MapPin, Calendar, Globe, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string, tripId?: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { isAuthenticated, profile } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Journal',
      icon: Compass,
      target: 'dashboard',
    },
    {
      id: 'trips',
      label: 'My Trips',
      icon: MapPin,
      target: 'trips',
    },
    {
      id: 'destinations',
      label: 'Destinations',
      icon: Globe,
      target: 'destinations',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      target: 'calendar',
    },
    {
      id: isAuthenticated ? 'profile' : 'login',
      label: isAuthenticated ? (profile?.displayName?.split(' ')[0] || 'Profile') : 'Sign In',
      icon: isAuthenticated ? User : LogIn,
      target: isAuthenticated ? 'profile' : 'login',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-lg border-t border-stone-200/90 px-3 py-1.5 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'trips' && currentView === 'trip-detail');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.target)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#1B4332]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <div
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#1B4332]/10 scale-105' : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#1B4332] stroke-[2.4]' : 'text-stone-600 stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[62px] ${
                  isActive ? 'font-bold text-[#1B4332]' : 'font-medium text-stone-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
