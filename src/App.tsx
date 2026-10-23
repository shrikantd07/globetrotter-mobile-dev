/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTrips } from './context/TripContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { TripListView } from './components/trips/TripListView';
import { TripDetailView } from './components/trips/TripDetailView';
import { DestinationExplorer } from './components/destinations/DestinationExplorer';
import { CalendarView } from './components/calendar/CalendarView';
import { ProfileView } from './components/profile/ProfileView';
import { CreateTripModal } from './components/trips/CreateTripModal';
import { AiPlannerModal } from './components/ai/AiPlannerModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { SharedTripView } from './components/share/SharedTripView';
import { BottomNav } from './components/common/BottomNav';
import { Trip } from './types/travel';

const PROTECTED_VIEWS = ['dashboard', 'trips', 'trip-detail', 'calendar', 'profile'];

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const { trips, activeTrip, selectTrip, createTrip } = useTrips();

  // Immediate synchronous auth check to prevent state race condition
  const isUserAuthed = isAuthenticated || (typeof window !== 'undefined' && Boolean(localStorage.getItem('gt_auth_user')));

  // Navigation state - default to separate login page if unauthenticated
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#/destinations') return 'destinations';
      if (hash === '#/signup') return 'signup';
      if (hash === '#/landing') return 'landing';
    }
    return 'login';
  });
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingTarget, setPendingTarget] = useState<{ view: string; tripId?: string } | null>(null);

  // Modals
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [prefilledDestination, setPrefilledDestination] = useState('');
  const [prefilledCover, setPrefilledCover] = useState<string | undefined>(undefined);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto-navigate directly to the new trip section when user logs in while on auth page
  useEffect(() => {
    if (isUserAuthed && (currentView === 'login' || currentView === 'signup')) {
      setAuthNotice(null);
      setPendingTarget(null);
      setCurrentView('trips');
      window.location.hash = '#/new-trip';
      setPrefilledDestination('');
      setPrefilledCover(undefined);
      setIsCreateTripOpen(true);
    }
  }, [isUserAuthed, currentView]);

  // Sync hash routing
  useEffect(() => {
    if (isLoading) return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/share/')) {
        const token = hash.replace('#/share/', '').trim();
        setShareToken(token);
        return;
      }
      
      setShareToken(null);

      if (hash === '#/new-trip') {
        if (!isUserAuthed) {
          setPendingTarget({ view: 'trips' });
          setAuthNotice('Please sign in or create an account to create a new trip.');
          setCurrentView('login');
          window.location.hash = '#/login';
          return;
        }
        setCurrentView('trips');
        setIsCreateTripOpen(true);
        return;
      }

      if (hash.startsWith('#/trip/')) {
        const tripId = hash.replace('#/trip/', '').trim();
        if (!isUserAuthed) {
          setPendingTarget({ view: 'trip-detail', tripId });
          setAuthNotice('Please sign in or create an account to view and manage trip itineraries.');
          setCurrentView('login');
          window.location.hash = '#/login';
          return;
        }
        selectTrip(tripId);
        setCurrentView('trip-detail');
        return;
      }

      let requested = isUserAuthed ? 'dashboard' : 'login';
      if (hash === '#/dashboard') requested = 'dashboard';
      else if (hash === '#/trips') requested = 'trips';
      else if (hash === '#/destinations') requested = 'destinations';
      else if (hash === '#/calendar') requested = 'calendar';
      else if (hash === '#/profile') requested = 'profile';
      else if (hash === '#/login' || hash === '#/signin' || hash === '#/auth') requested = 'login';
      else if (hash === '#/signup') requested = 'signup';
      else if (hash === '#/landing' || hash === '#/explore') requested = 'landing';
      else if (hash === '' || hash === '#/') {
        requested = isUserAuthed ? 'dashboard' : 'login';
      }

      // Route guard: Prevent unauthorized access to dashboard and protected views
      if (PROTECTED_VIEWS.includes(requested) && !isUserAuthed) {
        setPendingTarget({ view: requested });
        setAuthNotice(
          requested === 'dashboard'
            ? 'Sign in required: Please sign in or create an account to enter the travel dashboard.'
            : `Sign in required: Please sign in or create an account to access ${requested === 'trips' ? 'your trips' : requested}.`
        );
        setCurrentView('login');
        window.location.hash = '#/login';
        return;
      }

      setCurrentView(requested);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isUserAuthed, isLoading, selectTrip]);

  // Update hash when currentView changes
  const navigateTo = (view: string, tripId?: string) => {
    if (tripId) {
      if (!isUserAuthed) {
        setPendingTarget({ view: 'trip-detail', tripId });
        setAuthNotice('Please sign in or create an account to view this trip itinerary.');
        setCurrentView('login');
        window.location.hash = '#/login';
        return;
      }
      selectTrip(tripId);
      setCurrentView('trip-detail');
      window.location.hash = `#/trip/${tripId}`;
      return;
    }

    if (view === 'auth' || view === 'login') {
      setCurrentView('login');
      window.location.hash = '#/login';
      return;
    }

    if (view === 'signup') {
      setCurrentView('signup');
      window.location.hash = '#/signup';
      return;
    }

    // Guard check for navigation
    if (PROTECTED_VIEWS.includes(view) && !isUserAuthed) {
      setPendingTarget({ view });
      setAuthNotice(
        view === 'dashboard'
          ? 'Sign in required: Please sign in or create an account to enter the travel dashboard.'
          : `Sign in required: Please sign in or create an account to access ${view === 'trips' ? 'your itineraries' : view}.`
      );
      setCurrentView('login');
      window.location.hash = '#/login';
      return;
    }

    setCurrentView(view);
    if (view === 'landing') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${view}`;
    }
  };

  const handleSelectTrip = async (tripId: string) => {
    if (!isUserAuthed) {
      setPendingTarget({ view: 'trip-detail', tripId });
      setAuthNotice('Please sign in or create an account to access this trip.');
      setCurrentView('login');
      window.location.hash = '#/login';
      return;
    }
    await selectTrip(tripId);
    setCurrentView('trip-detail');
    window.location.hash = `#/trip/${tripId}`;
  };

  const handlePlanTripToDestination = (destination: string, coverImage: string) => {
    if (!isUserAuthed) {
      setPendingTarget({ view: 'dashboard' });
      setAuthNotice(`Please sign in or create an account to plan your journey to ${destination}.`);
      setCurrentView('login');
      window.location.hash = '#/login';
      return;
    }
    setPrefilledDestination(destination);
    setPrefilledCover(coverImage);
    setIsCreateTripOpen(true);
  };

  // If session is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
        <div className="w-9 h-9 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin"></div>
        <p className="text-xs uppercase tracking-widest font-semibold text-stone-500">
          Loading GlobeTrotter...
        </p>
      </div>
    );
  }

  // If viewing a public shared itinerary via #/share/:token
  if (shareToken) {
    return (
      <SharedTripView
        token={shareToken}
        onGoHome={() => {
          window.location.hash = '';
          setShareToken(null);
          setCurrentView('landing');
        }}
      />
    );
  }

  // Guard: If current view is protected and user is not authenticated, render AuthPage
  if (!isUserAuthed && (PROTECTED_VIEWS.includes(currentView) || currentView === 'trip-detail')) {
    return (
      <AuthPage
        initialMode="signin"
        notice={authNotice || "Sign in required: Please sign in or create an account to enter the application."}
        onSuccess={() => {
          setAuthNotice(null);
          setPendingTarget(null);
          setCurrentView('trips');
          window.location.hash = '#/new-trip';
          setPrefilledDestination('');
          setPrefilledCover(undefined);
          setIsCreateTripOpen(true);
        }}
      />
    );
  }

  // If on full-page authentication route (#/login, #/signin, #/signup, #/auth)
  if (currentView === 'login' || currentView === 'signup') {
    return (
      <AuthPage
        initialMode={currentView === 'signup' ? 'signup' : 'signin'}
        notice={authNotice}
        onSuccess={() => {
          setAuthNotice(null);
          setPendingTarget(null);
          setCurrentView('trips');
          window.location.hash = '#/new-trip';
          setPrefilledDestination('');
          setPrefilledCover(undefined);
          setIsCreateTripOpen(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenCreateTrip={() => {
          if (!isAuthenticated) {
            setPendingTarget({ view: 'dashboard' });
            setAuthNotice('Sign in required: Please sign in or create an account to create a new trip.');
            navigateTo('login');
            return;
          }
          setPrefilledDestination('');
          setPrefilledCover(undefined);
          setIsCreateTripOpen(true);
        }}
        onOpenAiPlanner={() => {
          if (!isAuthenticated) {
            setPendingTarget({ view: 'dashboard' });
            setAuthNotice('Sign in required: Please sign in or create an account to access the AI Travel Co-Pilot.');
            navigateTo('login');
            return;
          }
          setIsAiPlannerOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0">
        {currentView === 'landing' && (
          <LandingPage
            onStartPlanning={() => {
              if (isAuthenticated) {
                navigateTo('dashboard');
              } else {
                setPendingTarget({ view: 'dashboard' });
                setAuthNotice('Sign in required: Please sign in or create an account to enter the travel dashboard.');
                navigateTo('login');
              }
            }}
            onExploreDestinations={() => navigateTo('destinations')}
            onOpenTrip={handleSelectTrip}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {currentView !== 'landing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {currentView === 'dashboard' && (
              <DashboardView
                onSelectTrip={handleSelectTrip}
                onOpenCreateTrip={() => {
                  setPrefilledDestination('');
                  setPrefilledCover(undefined);
                  setIsCreateTripOpen(true);
                }}
                onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'trips' && (
              <TripListView
                onSelectTrip={handleSelectTrip}
                onOpenCreateTrip={() => {
                  setPrefilledDestination('');
                  setPrefilledCover(undefined);
                  setIsCreateTripOpen(true);
                }}
              />
            )}

            {currentView === 'trip-detail' && activeTrip && (
              <TripDetailView
                trip={activeTrip}
                onBack={() => navigateTo('trips')}
                onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
              />
            )}

            {currentView === 'trip-detail' && !activeTrip && (
              <div className="text-center py-20 space-y-4">
                <p className="text-stone-500 font-light">No trip selected or trip was removed.</p>
                <button
                  onClick={() => navigateTo('trips')}
                  className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-xs font-semibold"
                >
                  Return to All Trips
                </button>
              </div>
            )}

            {currentView === 'destinations' && (
              <DestinationExplorer
                onPlanTripToDestination={handlePlanTripToDestination}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView onSelectTrip={handleSelectTrip} />
            )}

            {currentView === 'profile' && (
              <ProfileView />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onSubmit={async (tripData) => {
          const newTrip = await createTrip(tripData);
          await selectTrip(newTrip.id);
          setCurrentView('trip-detail');
          return newTrip;
        }}
        initialDestination={prefilledDestination}
        initialCoverImage={prefilledCover}
      />

      <AiPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        targetTrip={activeTrip}
        onTripCreated={(newTrip) => {
          selectTrip(newTrip.id);
          setCurrentView('trip-detail');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onNavigate={navigateTo}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <MainApp />
      </TripProvider>
    </AuthProvider>
  );
}
