import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Plane, MapPin, Star, ArrowRight, Shield, Clock, Users, Heart,
  Sparkles, Calendar, Award, Headphones, CreditCard, Play, Plus,
  Minus, Trash2, Route, ShoppingCart, IndianRupee, CheckCircle2,
  X, Search, ChevronRight,
} from 'lucide-react';
import { getFeaturedPackages, getAllDestinations } from '../services/api';
import Loading from '../components/common/Loading';
import { useCart } from '../context/CartContext';

/* ── Helpers ── */
function fmt(n) {
  if (!n) return '₹0';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + Math.round(n / 1000) + 'k';
  return '₹' + n;
}

function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return { count, ref };
}

const POPULAR_CITIES = [
  'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Goa', 'Kochi',
];

const DEST_SUGGESTIONS = [
  'Goa', 'Manali', 'Kashmir', 'Shimla', 'Jaipur', 'Udaipur', 'Jaisalmer',
  'Kerala', 'Andaman', 'Mumbai', 'Bali', 'Dubai', 'Thailand', 'Singapore',
  'Maldives', 'Vietnam', 'Turkey', 'Switzerland',
];

/* ── Destination Card on homepage ── */
function DestCard({ dest }) {
  return (
    <Link to={`/packages?search=${encodeURIComponent(dest.name)}`}
      className="group relative rounded-2xl overflow-hidden aspect-[3/4] block flex-shrink-0 w-40 md:w-48">
      <img src={dest.image || `https://images.unsplash.com/photo-1507525428034?w=300&q=70`}
        alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="font-bold text-white text-sm">{dest.name}</div>
        <div className="text-white/70 text-xs mt-0.5">
          Starting from {fmt(dest.economyPerNight * 2)}
        </div>
      </div>
      {dest.rating >= 4.8 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Trending</span>
      )}
    </Link>
  );
}

/* ── Package Card for homepage featured ── */
function FeaturedCard({ pkg }) {
  const img = pkg.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80';
  return (
    <Link to={`/packages/${pkg._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 flex-shrink-0 w-64 md:w-72">
      <div className="relative h-44 overflow-hidden">
        {pkg.isBestSeller && <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Best Seller</span>}
        {pkg.category === 'Luxury' && <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Popular</span>}
        <img src={img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-surface-900 text-sm leading-tight line-clamp-1 group-hover:text-primary-600 transition-colors">{pkg.title}</h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700">{pkg.rating?.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-xs text-surface-400 mb-3 flex items-center gap-2">
          <Clock className="w-3 h-3" />{pkg.duration}D/{Math.max(1, pkg.duration - 1)}N
          <MapPin className="w-3 h-3 ml-1" />{pkg.destination}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-surface-400">Starting from</div>
            <div className="font-display font-extrabold text-lg text-primary-600 flex items-center">
              <IndianRupee className="w-4 h-4" />{pkg.price?.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all">View →</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Hero Search (Holiday Packages tab only) ── */
function PackagesSearch({ navigate }) {
  const [from, setFrom] = useState('New Delhi');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [roomCount, setRoomCount] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [subTab, setSubTab] = useState('Search');
  const [showFromDD, setShowFromDD] = useState(false);
  const [showToDD, setShowToDD] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDD(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDD(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const SUB_TABS = [
    { label: 'Search', category: '' },
    { label: 'Honeymoon', category: 'Honeymoon' },
    { label: 'Adventure', category: 'Adventure' },
    { label: 'Family', category: 'Family' },
    { label: 'Luxury', category: 'Luxury' },
    { label: 'Beach', category: 'Beach' },
  ];

  const handleSearch = () => {
    const activeTab = SUB_TABS.find(t => t.label === subTab);
    const params = new URLSearchParams();
    if (to.trim()) params.set('search', to.trim());
    if (activeTab?.category) params.set('category', activeTab.category);
    navigate(`/packages${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div>
      {/* Sub tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {SUB_TABS.map(t => (
          <button key={t.label} onClick={() => setSubTab(t.label)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${subTab === t.label ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-surface-200 rounded-2xl divide-y sm:divide-y-0 sm:divide-x divide-surface-200 mb-5 bg-white overflow-hidden">
        {/* From */}
        <div ref={fromRef} className="relative p-4 search-field-box min-w-0 overflow-hidden">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1 truncate">FROM CITY</div>
          <input value={from} onChange={e => setFrom(e.target.value)} onFocus={() => setShowFromDD(true)}
            className="w-full font-bold text-surface-800 text-base bg-transparent border-0 p-0 focus:outline-none focus:ring-0 min-w-0" />
          <div className="text-xs text-surface-400 mt-0.5">India</div>
          {showFromDD && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
              {POPULAR_CITIES.filter(c => c.toLowerCase().includes(from.toLowerCase())).map(c => (
                <button key={c} onClick={() => { setFrom(c); setShowFromDD(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>

        {/* To */}
        <div ref={toRef} className="relative p-4 search-field-box min-w-0 overflow-hidden">
          <div className="text-[11px] font-bold text-surface-400 uppercase mb-1 leading-tight truncate">TO CITY/COUNTRY/CATEGORY</div>
          <input value={to} onChange={e => setTo(e.target.value)} onFocus={() => setShowToDD(true)}
            placeholder="Type a destination..."
            className="w-full font-bold text-surface-800 text-base bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-surface-300 placeholder:font-normal" />
          <div className="text-xs text-surface-400 mt-0.5">India or International</div>
          {showToDD && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
              {DEST_SUGGESTIONS.filter(c => c.toLowerCase().includes(to.toLowerCase())).map(c => (
                <button key={c} onClick={() => { setTo(c); setShowToDD(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="relative p-4 min-w-0 overflow-hidden cursor-pointer" onClick={() => document.getElementById('dep-date-input').showPicker?.()  }>
          <div className="text-[11px] font-bold text-surface-400 uppercase mb-1 leading-tight">DEPARTURE DATE</div>
          <div className="font-bold text-surface-800 text-base leading-tight truncate">
            {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date'}
          </div>
          <div className="text-xs text-surface-400 mt-0.5">{date ? 'Tap to change' : 'Click to pick'}</div>
          <input id="dep-date-input" type="date" value={date} onChange={e => setDate(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </div>

        {/* Rooms */}
        <div className="p-4 min-w-0">
          <div className="text-[11px] font-bold text-surface-400 uppercase mb-2 leading-tight">ROOMS & GUESTS</div>
          {/* Guests row */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="text-xs font-semibold text-surface-600 shrink-0">
              <span className="font-bold text-surface-800">{guestCount}</span> Guest{guestCount !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => setGuestCount(v => Math.max(1, v - 1))}
                className="w-6 h-6 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                <Minus className="w-3 h-3 text-surface-600" />
              </button>
              <button type="button" onClick={() => setGuestCount(v => Math.min(20, v + 1))}
                className="w-6 h-6 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 text-surface-600" />
              </button>
            </div>
          </div>
          {/* Rooms row */}
          <div className="flex items-center justify-between gap-1">
            <div className="text-xs font-semibold text-surface-600 shrink-0">
              <span className="font-bold text-surface-800">{roomCount}</span> Room{roomCount !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => setRoomCount(v => Math.max(1, v - 1))}
                className="w-6 h-6 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                <Minus className="w-3 h-3 text-surface-600" />
              </button>
              <button type="button" onClick={() => setRoomCount(v => Math.min(8, v + 1))}
                className="w-6 h-6 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 text-surface-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <button onClick={handleSearch}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base px-8 sm:px-16 py-3.5 sm:py-4 rounded-full shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 tracking-wide uppercase w-full sm:w-auto">
          SEARCH PACKAGES
        </button>
      </div>
    </div>
  );
}

/* ── Trip Builder (Customize Trip tab) ── */
function TripBuilderSearch({ navigate }) {
  const { cart, addDestination, removeDestination, updateCart, setBudgetTier, setTravelers } = useCart();
  const [destInput, setDestInput] = useState('');
  const [destDays, setDestDays] = useState(3);
  const [showDD, setShowDD] = useState(false);
  const [allDests, setAllDests] = useState([]);

  useEffect(() => {
    getAllDestinations().then(r => setAllDests(r.data.data || [])).catch(() => { });
  }, []);

  const filtered = allDests.filter(d => !destInput || d.name.toLowerCase().includes(destInput.toLowerCase())).slice(0, 7);

  const TIER_COLORS = { Economy: 'bg-emerald-500', Standard: 'bg-blue-500', Luxury: 'bg-violet-600' };
  const budgetTier = cart.budgetTier || 'Standard';

  // Live cost calc
  const TIER_KEY = { Economy: 'economyPerNight', Standard: 'standardPerNight', Luxury: 'luxuryPerNight' };
  const totalDays = cart.destinations.reduce((s, d) => s + (d.days || 0), 0);
  const totalCost = cart.destinations.reduce((s, d) => {
    const perN = d[TIER_KEY[budgetTier]] || d.costPerDay || 5000;
    return s + perN * (d.days || 1) * cart.numberOfTravelers + (d.transportCharge || 2000) * cart.numberOfTravelers + (d.activitiesCharge || 2000) * cart.numberOfTravelers;
  }, 0);

  return (
    <div>
      {/* Row 1: trip config */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-surface-200 rounded-2xl divide-y md:divide-y-0 md:divide-x divide-surface-200 mb-5 bg-white">
        {/* Travelers */}
        <div className="p-4">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2">TRAVELERS</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTravelers(Math.max(1, cart.numberOfTravelers - 1))} className="w-7 h-7 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors"><Minus className="w-3.5 h-3.5 text-surface-600" /></button>
            <span className="font-bold text-surface-800 text-lg w-5 text-center">{cart.numberOfTravelers}</span>
            <button onClick={() => setTravelers(Math.min(20, cart.numberOfTravelers + 1))} className="w-7 h-7 rounded-full bg-surface-100 hover:bg-primary-100 flex items-center justify-center transition-colors"><Plus className="w-3.5 h-3.5 text-surface-600" /></button>
          </div>
        </div>

        {/* Start Date */}
        <div className="p-4">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2">START DATE</div>
          <input type="date" value={cart.startDate} onChange={e => updateCart({ startDate: e.target.value })}
            className="w-full font-bold text-surface-800 text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0" />
        </div>

        {/* Budget */}
        <div className="p-4 md:col-span-2">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-2">BUDGET TIER</div>
          <div className="flex gap-2">
            {['Economy', 'Standard', 'Luxury'].map(tier => (
              <button key={tier} onClick={() => setBudgetTier(tier)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${budgetTier === tier ? TIER_COLORS[tier] + ' text-white border-transparent' : 'border-surface-200 text-surface-500 hover:border-primary-400'}`}>
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Add destination */}
      <div className="border border-dashed border-primary-200 rounded-2xl p-4 mb-4 bg-primary-50/30">
        <div className="flex items-center gap-2 mb-3">
          <Route className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-bold text-primary-700">Build Your Route</span>
        </div>
        <div className="flex gap-2 relative">
          <input value={destInput} onChange={e => { setDestInput(e.target.value); setShowDD(true); }} onFocus={() => setShowDD(true)}
            placeholder="Add destination (Goa, Bali, Kashmir…)"
            className="flex-1 border border-surface-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
          {showDD && (destInput || filtered.length > 0) && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {filtered.map(d => (
                <button key={d._id} onClick={() => { addDestination({ _id: d._id, name: d.name, days: destDays, economyPerNight: d.economyPerNight, standardPerNight: d.standardPerNight, luxuryPerNight: d.luxuryPerNight, transportCharge: d.transportCharge, activitiesCharge: d.activitiesCharge }); setDestInput(''); setShowDD(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 flex items-center gap-3 transition-colors">
                  {d.image && <img src={d.image} className="w-7 h-7 rounded-lg object-cover" alt="" />}
                  <div>
                    <div className="font-semibold text-surface-800">{d.name}</div>
                    <div className="text-xs text-surface-400">{d.country} · Std: {fmt(d.standardPerNight)}/N</div>
                  </div>
                </button>
              ))}
              {destInput && filtered.length === 0 && (
                <button onClick={() => { addDestination({ name: destInput, days: destDays, standardPerNight: 5000, economyPerNight: 2000, luxuryPerNight: 12000, transportCharge: 2000, activitiesCharge: 2000 }); setDestInput(''); setShowDD(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-primary-600 font-semibold hover:bg-primary-50">
                  + Add "{destInput}" manually
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 border border-surface-200 rounded-xl px-3 py-2.5 bg-white">
            <button onClick={() => setDestDays(d => Math.max(1, d - 1))} className="text-surface-400 hover:text-primary-600"><Minus className="w-3 h-3" /></button>
            <span className="font-bold text-surface-700 text-sm w-10 text-center">{destDays}N</span>
            <button onClick={() => setDestDays(d => Math.min(30, d + 1))} className="text-surface-400 hover:text-primary-600"><Plus className="w-3 h-3" /></button>
          </div>
        </div>
      </div>

      {/* Route pills */}
      {cart.destinations.length > 0 && (
        <div className="border border-surface-200 rounded-2xl overflow-hidden mb-4">
          <div className="bg-surface-50 px-4 py-2.5 flex items-center justify-between border-b border-surface-100 text-xs">
            <span className="font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> {cart.destinations.length} stops · {totalDays} nights
            </span>
            {totalCost > 0 && <span className="font-bold text-primary-600">{fmt(totalCost)} est.</span>}
          </div>
          <div className="p-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
              <Plane className="w-3 h-3" /> Origin
            </div>
            {cart.destinations.map((dest, i) => (
              <div key={i} className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-surface-300 shrink-0" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 rounded-full text-xs font-semibold text-surface-700 group hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <MapPin className="w-3 h-3 text-primary-500" />
                  {dest.name} <span className="text-surface-400 font-normal">{dest.days}N</span>
                  <button onClick={() => removeDestination(i)} className="ml-0.5 text-surface-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cart.destinations.length === 0 && (
        <div className="text-center py-3 text-surface-400 text-sm flex items-center justify-center gap-2">
          <Route className="w-4 h-4 text-surface-300" /> Add destinations above to build your route
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center mt-4">
        <button onClick={() => navigate('/custom-trip')} disabled={cart.destinations.length === 0}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base px-8 sm:px-16 py-3.5 sm:py-4 rounded-full shadow-xl hover:shadow-orange-500/30 transition-all duration-300 tracking-wide uppercase flex items-center gap-2 w-full sm:w-auto justify-center">
          <ShoppingCart className="w-5 h-5" />
          {cart.destinations.length === 0 ? 'ADD DESTINATIONS' : `PLAN TRIP · ${totalDays}N`}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN HOME ══════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');

  const c1 = useCounter(10000);
  const c2 = useCounter(500);
  const c3 = useCounter(30);
  const c4 = useCounter(48);

  useEffect(() => {
    Promise.all([
      getFeaturedPackages().then(r => setPackages(Array.isArray(r?.data?.data) ? r.data.data : [])).catch(() => []),
      getAllDestinations().then(r => setDestinations(r?.data?.data || [])).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  const TRUST_PARTNERS = ['Emirates', 'IndiGo', 'MakeMyTrip', 'Yatra', 'AirAsia', 'Cleartrip'];

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=70" alt="hero" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

            {/* Left — headline */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Your Journey, Our Expertise
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
                Discover the World's<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-400">Most Beautiful</span><br />
                Places
              </h1>
              <p className="text-white/60 text-sm italic mb-2">with Dreams &amp; Affordability ✨</p>
              <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-md">
                Curated experiences, unbeatable prices and custom trips made just for you.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link to="/packages" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary-900/30 flex items-center gap-2 text-sm">
                  Explore Packages <ArrowRight className="w-4 h-4" />
                  <span className="text-white/60 text-xs font-normal ml-1">Handpicked deals</span>
                </Link>
                <Link to="/custom-trip" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 text-sm">
                  Build Custom Trip <ArrowRight className="w-4 h-4" />
                  <span className="text-white/50 text-xs font-normal ml-1">Plan your dream trip</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:gap-8 mt-6 sm:mt-10">
                {[
                  { ref: c1.ref, count: c1.count, suffix: '+', label: 'Happy Travelers' },
                  { ref: c2.ref, count: c2.count, suffix: '+', label: 'Tour Packages' },
                  { ref: c3.ref, count: c3.count, suffix: '+', label: 'Countries' },
                  { ref: c4.ref, count: c4.count, suffix: '', label: 'Customer Rating', prefix: '' },
                ].map((s, i) => (
                  <div key={i} ref={s.ref}>
                    <div className="font-display font-extrabold text-xl sm:text-2xl text-white">{s.prefix}{s.count.toLocaleString()}{s.suffix}</div>
                    <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Search Widget */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6">
                {/* Tabs */}
                <div className="flex gap-1 bg-surface-100 rounded-2xl p-1 mb-6">
                  <button onClick={() => setActiveTab('packages')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'packages' ? 'bg-white shadow-md text-primary-700' : 'text-surface-500 hover:text-surface-700'}`}>
                    🏖️ Holiday Packages
                  </button>
                  <button onClick={() => setActiveTab('customize')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'customize' ? 'bg-white shadow-md text-orange-600' : 'text-surface-500 hover:text-surface-700'}`}>
                    ✏️ Customize Trip
                  </button>
                </div>
                {activeTab === 'packages'
                  ? <PackagesSearch navigate={navigate} />
                  : <TripBuilderSearch navigate={navigate} />
                }
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST PARTNERS ── */}
      <div className="bg-surface-50 border-y border-surface-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider whitespace-nowrap shrink-0">Trusted by 500+ Travel Partners</span>
            <div className="flex gap-8 items-center overflow-x-auto">
              {TRUST_PARTNERS.map(p => (
                <span key={p} className="text-surface-400 font-bold text-sm whitespace-nowrap shrink-0 hover:text-surface-600 transition-colors">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── POPULAR DESTINATIONS ── */}
      {destinations.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-surface-900">Popular Destinations</h2>
                <p className="text-surface-400 mt-1 text-sm">Explore handpicked destinations loved by travelers</p>
              </div>
              <Link to="/packages" className="text-primary-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View all destinations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {destinations.slice(0, 10).map(d => <DestCard key={d._id} dest={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PACKAGES ── */}
      <section className="py-14 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-surface-900">Featured Packages</h2>
              <p className="text-surface-400 mt-1 text-sm">Curated packages for unforgettable experiences</p>
            </div>
            <Link to="/packages" className="text-primary-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View all packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? <div className="py-12"><Loading /></div> : (
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {packages.map(pkg => <FeaturedCard key={pkg._id} pkg={pkg} />)}
              {packages.length === 0 && (
                <div className="text-center py-12 w-full text-surface-400">
                  <p>No packages yet. Run the seed script to populate.</p>
                  <code className="text-xs bg-surface-100 px-3 py-1 rounded-lg mt-2 inline-block">node src/seedData.js</code>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-surface-900 mb-3">Why Choose TravelHub?</h2>
            <p className="text-surface-400 max-w-xl mx-auto">We make every trip stress-free with expert planning, 24/7 support, and the best prices.</p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Shield, color: 'bg-blue-50 text-blue-600', title: 'Safe & Secure', desc: '100% secure bookings with full refund protection' },
              { icon: Award, color: 'bg-amber-50 text-amber-600', title: 'Best Price', desc: 'Price match guarantee on all packages' },
              { icon: Headphones, color: 'bg-green-50 text-green-600', title: '24/7 Support', desc: 'Expert travel assistance round the clock' },
              { icon: CreditCard, color: 'bg-violet-50 text-violet-600', title: 'Easy EMI', desc: 'Flexible payment options for every budget' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-surface-50 rounded-2xl p-6 text-center hover:shadow-card transition-all">
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-surface-900 mb-2">{f.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-primary-200 text-lg mb-8">Join 10,000+ travelers who've discovered their dream destinations with us.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link to="/packages" className="bg-white text-primary-700 font-extrabold px-10 py-4 rounded-2xl hover:bg-surface-50 transition-all shadow-xl text-sm">
              Browse Packages
            </Link>
            <Link to="/contact" className="border-2 border-white/40 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all text-sm">
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
