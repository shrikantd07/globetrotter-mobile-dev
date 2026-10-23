import React, { useState } from 'react';
import { Search, MapPin, Calendar, DollarSign, Sparkles, Plus, ArrowRight, X } from 'lucide-react';
import { SEED_DESTINATIONS } from '../../data/seedDestinations';
import { Destination } from '../../types/travel';

interface DestinationExplorerProps {
  onPlanTripToDestination: (destination: string, coverImage: string) => void;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  onPlanTripToDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Africa'];
  const budgetTiers = ['All', '$ Budget', '$$ Moderate', '$$$ Upscale', '$$$$ Luxury'];

  const getCostIndex = (dailyCost: number) => {
    if (dailyCost <= 120) return { symbol: '$', tier: 'Budget', label: '$ (Budget)' };
    if (dailyCost <= 180) return { symbol: '$$', tier: 'Moderate', label: '$$ (Moderate)' };
    if (dailyCost <= 250) return { symbol: '$$$', tier: 'Upscale', label: '$$$ (Upscale)' };
    return { symbol: '$$$$', tier: 'Luxury', label: '$$$$ (Luxury)' };
  };

  const getPopularityBadge = (id: string) => {
    switch (id) {
      case 'dest-amalfi':
        return { text: 'Trending Top Pick', bg: 'bg-rose-500/90 text-white' };
      case 'dest-kyoto':
        return { text: "Editor's Choice", bg: 'bg-emerald-600/90 text-white' };
      case 'dest-swiss-alps':
        return { text: 'Iconic Wonder', bg: 'bg-blue-600/90 text-white' };
      case 'dest-patagonia':
        return { text: 'Adventure Classic', bg: 'bg-amber-600/90 text-white' };
      case 'dest-cape-town':
        return { text: 'Popular Coastal', bg: 'bg-purple-600/90 text-white' };
      case 'dest-marrakech':
        return { text: 'Cultural Gem', bg: 'bg-orange-600/90 text-white' };
      default:
        return { text: 'Verified Haven', bg: 'bg-stone-700/90 text-white' };
    }
  };

  const getRecommendedDuration = (name: string) => {
    if (name.includes('Amalfi') || name.includes('Kyoto')) return '5–7 Days';
    if (name.includes('Lauterbrunnen') || name.includes('Torres')) return '7–10 Days';
    return '4–6 Days';
  };

  const autocompleteSuggestions = searchQuery.trim().length > 0
    ? SEED_DESTINATIONS.filter(
        d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const filtered = SEED_DESTINATIONS.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesContinent = selectedContinent === 'All' || dest.continent === selectedContinent;

    const costIndex = getCostIndex(dest.averageDailyCost);
    const matchesBudget =
      selectedBudgetTier === 'All' ||
      (selectedBudgetTier.startsWith('$ ') && costIndex.tier === 'Budget') ||
      (selectedBudgetTier.startsWith('$$ ') && costIndex.tier === 'Moderate') ||
      (selectedBudgetTier.startsWith('$$$ ') && costIndex.tier === 'Upscale') ||
      (selectedBudgetTier.startsWith('$$$$ ') && costIndex.tier === 'Luxury');

    return matchesSearch && matchesContinent && matchesBudget;
  });

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
            Curated World Atlas
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-1">
            Discover Exceptional Havens
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-2xl font-light">
            Browse verified destination portfolios with seasonal weather intelligence, daily expenditure estimates, and curated activities to jumpstart your itinerary.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Auto-complete Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search city, country, or interest (e.g. Kyoto, Italy)..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />

              {/* Autocomplete Dropdown */}
              {isSearchFocused && autocompleteSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-stone-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-50">
                    Suggested Destinations
                  </div>
                  {autocompleteSuggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.name);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50/70 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span className="font-semibold text-stone-900">{item.name}</span>
                        <span className="text-stone-400 text-[11px]">• {item.country}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800">
                        {getCostIndex(item.averageDailyCost).symbol}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Continent Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {continents.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedContinent(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedContinent === c
                      ? 'bg-[#1B4332] text-white shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier Filter */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
              Budget Tier:
            </span>
            {budgetTiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedBudgetTier(tier)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedBudgetTier === tier
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((dest) => {
          const costInfo = getCostIndex(dest.averageDailyCost);
          const popBadge = getPopularityBadge(dest.id);
          const recDuration = getRecommendedDuration(dest.name);

          return (
            <div
              key={dest.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Popularity Badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${popBadge.bg}`}>
                    {popBadge.text}
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-medium">
                    {dest.bestMonths}
                  </div>

                  {/* Cost Index & Duration Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="bg-[#1B4332]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-white text-xs font-semibold">
                      ~${dest.averageDailyCost} / day
                    </span>
                    <span className="bg-black/70 backdrop-blur-xs px-2 py-1 rounded-md text-amber-300 text-[11px] font-mono font-bold">
                      {costInfo.symbol}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-stone-800 text-[10px] font-semibold">
                    {recDuration}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-stone-500 font-medium">
                      {dest.country} • {dest.continent}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {costInfo.tier}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl font-bold text-stone-900">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 font-light leading-relaxed">
                    {dest.description}
                  </p>

                  {/* Highlights */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {dest.highlights.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 border-t border-stone-100 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveDestination(dest)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Read Guide
                </button>

                <button
                  onClick={() => onPlanTripToDestination(dest.name, dest.coverImage)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan Trip Here</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>



      {/* Destination Detailed Guide Modal */}
      {activeDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FBF8F3] rounded-3xl max-w-2xl w-full border border-stone-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Hero Cover */}
            <div className="relative aspect-16/8 overflow-hidden bg-stone-900">
              <img
                src={activeDestination.coverImage}
                alt={activeDestination.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <button
                onClick={() => setActiveDestination(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                aria-label="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
                  {activeDestination.country} • {activeDestination.continent}
                </span>
                <h2 className="font-editorial text-3xl font-bold">
                  {activeDestination.name}
                </h2>
              </div>
            </div>

            {/* Guide Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-stone-700 leading-relaxed font-light">
                {activeDestination.description}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-stone-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Best Season</div>
                  <div className="text-xs font-semibold text-stone-800">{activeDestination.bestMonths}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">Estimated Daily Cost</div>
                  <div className="text-xs font-semibold text-stone-800">~${activeDestination.averageDailyCost} / day</div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                  Iconic Highlights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                  {activeDestination.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]"></span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curated Activity Suggestions */}
              <div>
                <h4 className="font-editorial text-lg font-bold text-stone-900 mb-3">
                  Recommended Experiences
                </h4>
                <div className="space-y-2.5">
                  {activeDestination.suggestedActivities.map((act, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-stone-900">
                        <span>{act.name}</span>
                        <span className="text-emerald-800">${act.estCost}</span>
                      </div>
                      <p className="text-stone-500 font-light text-[11px]">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-stone-200 bg-white flex items-center justify-between">
              <button
                onClick={() => setActiveDestination(null)}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onPlanTripToDestination(activeDestination.name, activeDestination.coverImage);
                  setActiveDestination(null);
                }}
                className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Itinerary for {activeDestination.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
