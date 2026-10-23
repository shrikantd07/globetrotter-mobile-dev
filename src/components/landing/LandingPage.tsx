import React from 'react';
import { Compass, Sparkles, MapPin, Calendar, DollarSign, Share2, ArrowRight, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { SEED_DESTINATIONS } from '../../data/seedDestinations';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreDestinations: () => void;
  onOpenTrip: (tripId: string) => void;
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onExploreDestinations,
  onOpenTrip,
  onNavigateToLogin,
}) => {
  const { loginAsDemo, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900">
      {/* Editorial Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/5 border border-emerald-900/15 text-[#1B4332] text-xs font-semibold tracking-wider uppercase">
                <Compass className="w-3.5 h-3.5" />
                <span>The Art of Travel Planning</span>
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1B4332] leading-[1.08]">
                Bespoke journeys, crafted into timeless stories.
              </h1>

              <p className="text-lg sm:text-xl text-stone-600 font-normal leading-relaxed max-w-2xl">
                GlobeTrotter pairs luxury travel-magazine aesthetics with powerful day-by-day itinerary precision, real-time budget forecasting, and generative AI travel assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartPlanning}
                  className="px-7 py-4 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] font-medium text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreDestinations}
                  className="px-6 py-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium text-base shadow-2xs hover:border-stone-400 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Destinations</span>
                </button>

                <button
                  onClick={onNavigateToLogin}
                  className="px-6 py-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1B4332] border border-emerald-300/80 font-semibold text-base shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Traveler Sign In</span>
                </button>
              </div>

              {/* Social Proof Stats */}
              <div className="pt-8 border-t border-stone-200/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332]">100%</div>
                  <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-0.5">Custom Control</div>
                </div>
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332]">Day-by-Day</div>
                  <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-0.5">Chronological flow</div>
                </div>
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332]">AI Grounded</div>
                  <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-0.5">Gemini Co-Pilot</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Luxury Frame */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100 aspect-4/5 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
                    alt="Positano Amalfi Coast"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
                  
                  {/* Floating Badge on Image */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-900 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Featured Itinerary: Amalfi & Capri</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-xs uppercase tracking-widest text-emerald-300 font-medium">Day 2 • 08:30 AM</span>
                    <h3 className="font-editorial text-2xl font-bold">Path of the Gods Hike</h3>
                    <p className="text-xs text-stone-200 line-clamp-2 font-light">
                      Cliffside walking path between Bomerano and Nocelle with sweeping views of Capri.
                    </p>
                  </div>
                </div>

                {/* Floating Miniature Overlay Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-stone-200 hidden sm:flex items-center gap-3 max-w-xs">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#1B4332] flex items-center justify-center font-bold">
                    €
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Real-Time Budget Precision</div>
                    <div className="text-[11px] text-stone-500">Planned €1,450 / Budget €3,200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 bg-[#F4EFE6] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#1B4332]">
              Architected for Discerning Travelers
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1B4332]">
              Every tool to transform inspiration into reality.
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              No spreadsheets. No scattered bookmarks. GlobeTrotter brings harmony to the entire travel planning cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FBF8F3] p-8 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B4332] text-white flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Day-by-Day Itineraries</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Sequence activities with precise timings, arrival coordinates, categorized tickets, and drag-and-drop reordering.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FBF8F3] p-8 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#C57B57] text-white flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Budget & Expense Ledger</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Set travel budgets in any global currency. Log planned vs. actual costs by category to prevent budget surprises.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FBF8F3] p-8 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Gemini AI Concierge</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Generate curated, multi-day itineraries tailored to your travel style, pace, and interests with a single prompt.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FBF8F3] p-8 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Shareable Digital Journals</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Generate private, tokenized links for travel companions. Showcase your day-by-day plans in an editorial reading view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Showcase */}
      <section className="py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#1B4332]">
                Curated Escapes
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1B4332] mt-1">
                Destinations of Wonder
              </h2>
            </div>
            <button
              onClick={onExploreDestinations}
              className="mt-4 md:mt-0 text-sm font-semibold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1.5 cursor-pointer"
            >
              <span>View all guides</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SEED_DESTINATIONS.slice(0, 3).map((dest) => (
              <div
                key={dest.id}
                onClick={onExploreDestinations}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium">
                    {dest.bestMonths}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#1B4332]/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-white text-xs font-semibold">
                    Avg ~${dest.averageDailyCost}/day
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                      {dest.country} • {dest.continent}
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1 mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {dest.tagline}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#1B4332]">
                    <span>{dest.highlights.length} Highlights Curated</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How GlobeTrotter Works */}
      <section className="py-20 bg-[#F4EFE6] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#1B4332]">
              Simple & Elegant Workflow
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1B4332] mt-1">
              How GlobeTrotter Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-4">
              <span className="font-editorial text-4xl font-bold text-stone-300">01</span>
              <h3 className="font-editorial text-2xl font-bold text-[#1B4332]">Define Your Dates & Destination</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Choose a dream location or let our destination catalog inspire you. Set your travel duration, target budget, and personal travel style.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-4">
              <span className="font-editorial text-4xl font-bold text-stone-300">02</span>
              <h3 className="font-editorial text-2xl font-bold text-[#1B4332]">Build or Generate with AI</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Craft each day with activities, reservations, and scenic walks. Or prompt our Gemini Co-Pilot to generate a full structured schedule with estimated costs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-4">
              <span className="font-editorial text-4xl font-bold text-stone-300">03</span>
              <h3 className="font-editorial text-2xl font-bold text-[#1B4332]">Travel with Clarity & Share</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Follow your itinerary on the calendar, monitor expenses in real-time, and send beautiful read-only shareable links to friends and family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B4332] text-[#FBF8F3] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-emerald-900">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-editorial text-2xl font-bold tracking-tight">GlobeTrotter</span>
              </div>
              <p className="text-sm text-emerald-100/80 max-w-md font-light leading-relaxed">
                Dedicated to the joy of intentional wandering. Crafted with editorial elegance, persistent storage, and intelligent travel algorithms.
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-emerald-200 mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-emerald-100/70">
                <li><button onClick={onStartPlanning} className="hover:text-white transition-colors">Trip Journal</button></li>
                <li><button onClick={onExploreDestinations} className="hover:text-white transition-colors">Destination Catalog</button></li>
                <li><button onClick={onStartPlanning} className="hover:text-white transition-colors">AI Co-Pilot</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-emerald-200 mb-4">Philosophy</h4>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Travel is not a checklist of pins on a map—it is the memory of morning light in an ancient square and the flavors of shared bread.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-100/60">
            <p>© 2026 GlobeTrotter. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Powered by Gemini 3.8 Flash & Supabase PostgreSQL</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
