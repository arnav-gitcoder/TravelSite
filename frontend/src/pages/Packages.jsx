import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPackages } from '../services/api';
import Loading from '../components/common/Loading';
import {
  Search, SlidersHorizontal, Star, Clock, Users, MapPin,
  Heart, ChevronDown, X, Plane, Hotel, Utensils, Camera,
  IndianRupee, Filter, Sparkles, Compass
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All', emoji: '🌍' },
  { id: 'Honeymoon', label: 'Honeymoon', emoji: '💑' },
  { id: 'Adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'Family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'Luxury', label: 'Luxury', emoji: '💎' },
  { id: 'Cultural', label: 'Cultural', emoji: '🏛️' },
  { id: 'Beach', label: 'Beach', emoji: '🏖️' },
  { id: 'Budget', label: 'Budget', emoji: '💰' },
];

const BUDGETS = [
  { id: '', label: 'Any Budget' },
  { id: '0-20000',    label: 'Under ₹20,000' },
  { id: '20000-50000', label: '₹20,000 – ₹50,000' },
  { id: '50000-100000', label: '₹50,000 – ₹1,00,000' },
  { id: '100000-999999', label: 'Above ₹1,00,000' },
];

const DURATIONS = [
  { id: '', label: 'Any Duration' },
  { id: '1-3',  label: '1 – 3 Days' },
  { id: '4-6',  label: '4 – 6 Days' },
  { id: '7-9',  label: '7 – 9 Days' },
  { id: '10-99', label: '10+ Days' },
];

const DIFFICULTIES = [
  { id: '', label: 'Any Difficulty' },
  { id: 'Easy', label: 'Easy' },
  { id: 'Moderate', label: 'Moderate' },
  { id: 'Hard', label: 'Hard' },
];

const TRENDING = [
  { name: 'Kashmir', emoji: '🏔️' },
  { name: 'Bali', emoji: '🏝️' },
  { name: 'Goa', emoji: '🌴' },
  { name: 'Dubai', emoji: '🏜️' },
  { name: 'Thailand', emoji: '🇹🇭' },
  { name: 'Switzerland', emoji: '🇨🇭' }
];

const COLLAGE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', label: 'Bali', rotate: '-6deg', zIndex: 10, offset: 'top-2 left-4' },
  { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', label: 'Dubai', rotate: '2deg', zIndex: 20, offset: 'top-6 left-24' },
  { url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=400&q=80', label: 'Kashmir', rotate: '-2deg', zIndex: 15, offset: 'top-10 left-44' }
];

const SORT_OPTIONS = [
  { value: '-rating', label: 'Popular' },
  { value: 'price',   label: 'Price: Low → High' },
  { value: '-price',  label: 'Price: High → Low' },
  { value: '-createdAt', label: 'Newest' },
];

function PackageCard({ pkg }) {
  const [liked, setLiked] = useState(false);
  const img = pkg.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80';

  const inclusions = [
    pkg.includesAccommodation && { icon: Hotel, label: 'Hotel' },
    { icon: Plane, label: 'Flights' },
    pkg.includesFood && { icon: Utensils, label: pkg.includesFood === 'breakfast' ? 'Breakfast' : 'Meals' },
    { icon: Camera, label: 'Sightseeing' },
  ].filter(Boolean);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl overflow-hidden border border-surface-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
    >
      <Link to={`/packages/${pkg._id}`} className="flex flex-col h-full">
        {/* Large Image Container */}
        <div className="relative w-full h-56 overflow-hidden">
          {pkg.isBestSeller && (
            <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
          {pkg.category === 'Luxury' && (
            <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          )}
          <button 
            onClick={e => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform active:scale-95"
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-surface-600'}`} />
          </button>
          <img src={img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          
          {/* Destination Badge Overlay */}
          <div className="absolute bottom-4 left-4 bg-primary-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary-400" /> {pkg.destination}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-display font-bold text-surface-900 text-lg leading-snug group-hover:text-primary-600 transition-colors line-clamp-1">
                {pkg.title}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-extrabold text-amber-700">{(pkg.rating || 4.8).toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-surface-400 mb-4 font-semibold">
              <span className="flex items-center gap-1 text-primary-600">
                <Clock className="w-3.5 h-3.5" /> {pkg.duration} Days / {Math.max(1, pkg.duration - 1)} Nights
              </span>
              <span>•</span>
              <span className="bg-surface-100 text-surface-700 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold">
                {pkg.difficulty || 'Easy'}
              </span>
            </div>

            {/* Inclusions */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {inclusions.map((inc, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-surface-500 bg-surface-50 border border-surface-150 px-2.5 py-1 rounded-lg">
                  <inc.icon className="w-3 h-3 text-primary-500" /> {inc.label}
                </span>
              ))}
            </div>

            <p className="text-xs text-surface-500 leading-relaxed line-clamp-2 mb-4">{pkg.shortDescription}</p>
          </div>

          {/* Footer Pricing & CTA */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-100">
            <div>
              <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Estimated Budget</p>
              <div className="font-display font-extrabold text-xl text-surface-900 flex items-baseline gap-0.5 mt-0.5">
                <span>₹{pkg.price?.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-medium text-surface-400 lowercase ml-1">/person</span>
              </div>
            </div>
            
            <span className="bg-primary-600 hover:bg-primary-700 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md group-hover:shadow-lg shadow-primary-600/10 flex items-center gap-1">
              Explore Trip
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy]     = useState('-rating');
  const [budget, setBudget]     = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collapsible filter sections (desktop sidebar)
  const [expandedFilters, setExpandedFilters] = useState({
    budget: true,
    duration: true,
    difficulty: true
  });

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sortBy };
        if (search)   params.search = search;
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;
        if (budget) {
          const [min, max] = budget.split('-');
          params.minPrice = min;
          params.maxPrice = max;
        }
        if (duration) {
          const [min, max] = duration.split('-');
          params.minDuration = min;
          params.maxDuration = max;
        }
        const res = await getPackages(params);
        setPackages(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, category, sortBy, budget, duration, difficulty, page]);

  const clearFilters = () => { 
    setCategory(''); 
    setBudget(''); 
    setDuration(''); 
    setDifficulty('');
    setSearch(''); 
    setPage(1); 
  };

  const activeFilterCount = [category, budget, duration, difficulty].filter(Boolean).length;

  const SidebarFilters = () => (
    <div className="space-y-5">
      {/* Budget Filter */}
      <div className="border-b border-surface-100 pb-4">
        <button 
          onClick={() => toggleFilterSection('budget')}
          className="flex items-center justify-between w-full font-bold text-surface-900 text-sm py-1"
        >
          <span>Budget Range</span>
          <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${expandedFilters.budget ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {expandedFilters.budget && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 space-y-2"
            >
              {BUDGETS.map(b => (
                <label key={b.id} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="budget" 
                    checked={budget === b.id} 
                    onChange={() => { setBudget(b.id); setPage(1); }}
                    className="w-4 h-4 text-primary-600 accent-primary-600 border-surface-300 focus:ring-primary-500" 
                  />
                  <span className={`text-xs transition-colors ${budget === b.id ? 'text-primary-600 font-bold' : 'text-surface-600 group-hover:text-surface-900'}`}>
                    {b.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duration Filter */}
      <div className="border-b border-surface-100 pb-4">
        <button 
          onClick={() => toggleFilterSection('duration')}
          className="flex items-center justify-between w-full font-bold text-surface-900 text-sm py-1"
        >
          <span>Duration</span>
          <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${expandedFilters.duration ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {expandedFilters.duration && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 space-y-2"
            >
              {DURATIONS.map(d => (
                <label key={d.id} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="duration" 
                    checked={duration === d.id} 
                    onChange={() => { setDuration(d.id); setPage(1); }}
                    className="w-4 h-4 text-primary-600 accent-primary-600 border-surface-300 focus:ring-primary-500" 
                  />
                  <span className={`text-xs transition-colors ${duration === d.id ? 'text-primary-600 font-bold' : 'text-surface-600 group-hover:text-surface-900'}`}>
                    {d.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Difficulty Filter */}
      <div className="pb-2">
        <button 
          onClick={() => toggleFilterSection('difficulty')}
          className="flex items-center justify-between w-full font-bold text-surface-900 text-sm py-1"
        >
          <span>Difficulty</span>
          <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${expandedFilters.difficulty ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {expandedFilters.difficulty && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 space-y-2"
            >
              {DIFFICULTIES.map(d => (
                <label key={d.id} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="difficulty" 
                    checked={difficulty === d.id} 
                    onChange={() => { setDifficulty(d.id); setPage(1); }}
                    className="w-4 h-4 text-primary-600 accent-primary-600 border-surface-300 focus:ring-primary-500" 
                  />
                  <span className={`text-xs transition-colors ${difficulty === d.id ? 'text-primary-600 font-bold' : 'text-surface-600 group-hover:text-surface-900'}`}>
                    {d.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeFilterCount > 0 && (
        <button 
          onClick={clearFilters} 
          className="w-full text-center text-xs font-bold text-red-500 hover:text-red-600 py-2.5 border border-red-200 rounded-xl hover:bg-red-50/50 transition-all"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 pb-20 relative">
      {/* ── Section 1 — Compact Hero (Airbnb style) ── */}
      <div className="bg-primary-950 text-white relative overflow-hidden h-[280px] sm:h-[300px] flex items-center">
        {/* Background Subtle Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 bg-primary-900/50 border border-primary-800 px-3 py-1 rounded-full text-[10px] text-primary-300 font-bold"
            >
              <Compass className="w-3 h-3 animate-spin-slow" /> Expert Crafted Experiences
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight"
            >
              Find Your Perfect Trip
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-primary-200 text-xs sm:text-sm max-w-lg font-medium"
            >
              Handpicked travel experiences crafted by local experts to let you explore the world effortlessly.
            </motion.p>

            {/* Premium Single Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative max-w-lg bg-white rounded-2xl shadow-xl p-1 flex items-center border border-white/10"
            >
              <Search className="w-4.5 h-4.5 text-surface-400 ml-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Search destinations, packages, countries..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-2 pr-4 py-2 bg-transparent border-0 text-surface-900 text-xs focus:outline-none placeholder:text-surface-400 font-medium" 
              />
            </motion.div>

            {/* Trending Glassmorphism Chips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-1.5 pt-1"
            >
              <span className="text-[10px] text-primary-300 font-bold mr-1">Trending:</span>
              {TRENDING.map(t => (
                <button
                  key={t.name}
                  onClick={() => { setSearch(t.name); setPage(1); }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Hero Right: Destination Collage (Overlapping cards) */}
          <div className="hidden lg:block lg:col-span-5 relative h-[220px] w-full overflow-hidden">
            <div className="absolute inset-0">
              {COLLAGE_IMAGES.map((img, index) => (
                <motion.div
                  key={img.label}
                  initial={{ opacity: 0, scale: 0.8, rotate: '0deg' }}
                  animate={{ opacity: 1, scale: 1, rotate: img.rotate }}
                  transition={{ duration: 0.6, delay: 0.15 * index }}
                  whileHover={{ scale: 1.05, zIndex: 50, transition: { duration: 0.2 } }}
                  className={`absolute ${img.offset} w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 cursor-pointer`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6">
                    <p className="text-white text-[10px] font-bold tracking-wide flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-primary-400" /> {img.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2 — Sticky Category Navigation (Horizontal pill) ── */}
      <div className="bg-white border-b border-surface-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 sm:py-3.5 scrollbar-hide -mx-1 px-1">
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button 
                  key={cat.id} 
                  onClick={() => { setCategory(cat.id); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-500/20'
                      : 'text-surface-600 bg-surface-50 border border-surface-150 hover:bg-surface-100'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>{cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 3 — Smart Discovery Layout (75/25) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-6 sticky top-36 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-surface-100">
                <h3 className="font-bold text-surface-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <SidebarFilters />
            </div>
          </aside>

          {/* Right Main Grid */}
          <div className="flex-1 min-w-0">
            {/* ── Section 4 — Featured Packages Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-surface-900 flex items-center gap-2">
                  Featured Packages <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-surface-400 text-xs mt-0.5">
                  {loading ? 'Searching trips...' : `${total} experiences found`}
                </p>
              </div>

              {/* Sorting and Mobile Filter Toggle */}
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 bg-white border border-surface-200 px-4 py-2.5 rounded-xl font-bold text-xs text-surface-700 hover:bg-surface-50 shadow-sm transition-all"
                >
                  <Filter className="w-3.5 h-3.5 text-primary-500" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <div className="relative shrink-0">
                  <select 
                    value={sortBy} 
                    onChange={e => { setSortBy(e.target.value); setPage(1); }}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-surface-200 rounded-xl text-xs font-bold text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-sm cursor-pointer"
                  >
                    {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Packages Cards Grid */}
            {loading ? (
              <div className="py-24"><Loading /></div>
            ) : packages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-sm max-w-2xl mx-auto px-4">
                <span className="text-5xl block mb-4">🏜️</span>
                <h3 className="text-surface-900 text-lg font-bold mb-2">No packages found</h3>
                <p className="text-surface-400 text-sm mb-6 max-w-sm mx-auto">We couldn't find any holiday packages matching your search filters. Try clearing some selections.</p>
                <button onClick={clearFilters} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div>
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {packages.map(pkg => (
                      <PackageCard key={pkg._id} pkg={pkg} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-10 flex-wrap">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="px-3.5 py-2 bg-white border border-surface-200 rounded-xl text-xs font-bold text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white shadow-sm transition-all"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i + 1} 
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all shadow-sm ${page === i + 1 ? 'bg-primary-600 text-white shadow-primary-500/10' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                      disabled={page === totalPages}
                      className="px-3.5 py-2 bg-white border border-surface-200 rounded-xl text-xs font-bold text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white shadow-sm transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer (Bottom Sheet) ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
            />

            {/* Bottom Sheet Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[85vh] bg-white rounded-t-[32px] shadow-2xl p-6 overflow-y-auto z-10 border-t border-surface-100"
            >
              {/* Drag indicator handle */}
              <div className="w-12 h-1 bg-surface-200 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-extrabold text-lg text-surface-900">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-600 hover:bg-surface-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reuse sidebar filters directly */}
              <div className="pb-8">
                <SidebarFilters />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Conversion Optimization: Floating CTA "Build Custom Trip" ── */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link 
          to="/trip-planner"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> Build Custom Trip
        </Link>
      </motion.div>
    </div>
  );
}