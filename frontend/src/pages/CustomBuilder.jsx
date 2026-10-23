import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { createCustomPackage, getAllDestinations } from '../services/api';
import {
  Search, X, Plus, Trash2, Share2, Mail,
  MessageCircle, Copy, CheckCheck, MapPin,
  Plane, Users, Moon, IndianRupee, Sparkles,
  Shield, Star, Clock, ChevronDown, ChevronUp,
  Phone, User, FileText, ArrowRight, CheckCircle,
  Info, Zap,
} from 'lucide-react';

/* ── Helpers ─────────────────────────────────────── */
const fmtRange = (min, max) =>
  `₹${Math.round(min/1000)}k – ₹${Math.round(max/1000)}k`;

const getRange = (exact) => ({ min: Math.round(exact * 0.85), max: Math.round(exact * 1.20) });

const POPULAR = [
  { name: 'Dubai',       emoji: '🌆', country: 'UAE'         },
  { name: 'Bali',        emoji: '🌺', country: 'Indonesia'   },
  { name: 'Thailand',    emoji: '🏝️', country: 'Thailand'   },
  { name: 'Goa',         emoji: '🏖️', country: 'India'      },
  { name: 'Kashmir',     emoji: '🏔️', country: 'India'      },
  { name: 'Maldives',    emoji: '🐠', country: 'Maldives'    },
  { name: 'Switzerland', emoji: '🗻', country: 'Switzerland' },
  { name: 'Singapore',   emoji: '🦁', country: 'Singapore'   },
  { name: 'Manali',      emoji: '❄️', country: 'India'       },
  { name: 'Kerala',      emoji: '🌴', country: 'India'       },
];

const BUDGET_OPTIONS = [
  { id: 'economy',  label: 'Economy',  icon: '🏨', range: '₹2k–5k/night',  desc: 'Budget hotels & guesthouses', multiplier: 1.0 },
  { id: 'standard', label: 'Standard', icon: '🏩', range: '₹5k–12k/night', desc: '3–4 star hotels',              multiplier: 1.0 },
  { id: 'luxury',   label: 'Luxury',   icon: '🏰', range: '₹12k+/night',   desc: '5-star & premium resorts',     multiplier: 1.0 },
];

/* ── Lead Capture Modal ─────────────────────────── */
function QuoteModal({ cart, budgetType, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', requirements: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(prev => ({ ...prev, [k]: v })); setErrors(prev => ({ ...prev, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCustomPackage({
        title: `Quote Request — ${cart.destinations.map(d => d.name).join(', ')}`,
        destinations: cart.destinations.map(d => ({
          name: d.name, days: d.nights || d.days || 1,
          costPerDay: d.standardPerNight || d.costPerDay || 0, description: '',
        })),
        numberOfTravelers: cart.numberOfTravelers,
        startDate: cart.startDate,
        endDate: cart.endDate,
        specialRequests: `Name: ${form.name} | Phone: ${form.phone} | WhatsApp: ${form.whatsapp || form.phone} | Email: ${form.email} | Requirements: ${form.requirements}`,
        userId: 'lead-' + Date.now(),
        budgetType,
        leadData: form,
      });
      setDone(true);
      setTimeout(() => { onClose(); navigate('/packages'); }, 4000);
    } catch {
      setDone(true);
    } finally { setSubmitting(false); }
  };

  const totalPrice = cart.totalPrice || 0;
  const range = getRange(totalPrice);

  const inputCls = (k) =>
    `w-full px-4 py-3 bg-surface-50 border ${errors[k] ? 'border-red-400' : 'border-surface-200'} rounded-xl text-sm outline-none focus:border-primary-500 transition-all`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[95vh] overflow-y-auto">

        {!done ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-surface-900">Get Your Final Quote</h3>
                <p className="text-sm text-surface-500 mt-1">Our experts will prepare your personalized itinerary.</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>

            {/* Trip Summary */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-3">Your Trip Summary</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cart.destinations.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 bg-white border border-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                    <MapPin className="w-3 h-3" />{d.name} · {d.nights || d.days}N
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-surface-600">
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary-500" />{cart.numberOfTravelers} traveler{cart.numberOfTravelers > 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-primary-500" />{cart.totalDays} nights</span>
                <span className="flex items-center gap-1 font-bold text-primary-700">
                  <IndianRupee className="w-3 h-3" />{totalPrice > 0 ? fmtRange(range.min, range.max) : 'TBD'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Rahul Sharma" className={`${inputCls('name')} pl-10`} />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210" className={`${inputCls('phone')} pl-10`} />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">WhatsApp</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                      placeholder="Same as phone" className={`${inputCls('whatsapp')} pl-10`} />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="rahul@example.com" className={`${inputCls('email')} pl-10`} />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Special Requirements <span className="text-surface-400 font-normal">(optional)</span></label>
                  <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={2}
                    placeholder="Honeymoon, anniversary, dietary needs, accessibility…"
                    className={`${inputCls('requirements')} resize-none`} />
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full btn-gold py-4 rounded-xl text-base font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Processing…</>
                ) : (
                  <><FileText className="w-4 h-4" />Request Detailed Itinerary</>
                )}
              </button>

              <p className="text-xs text-surface-400 text-center">
                🔒 Your details are secure. No spam, ever. We'll respond within 2 hours.
              </p>
            </form>
          </div>
        ) : (
          // Success state
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="font-display font-bold text-xl text-surface-900 mb-2">Trip Request Received!</h3>
            <p className="text-surface-500 text-sm mb-6">Our travel expert will contact you shortly with a customized itinerary and final pricing.</p>

            <div className="bg-surface-50 rounded-2xl p-4 text-left space-y-2 mb-6">
              {cart.destinations.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-surface-700">{d.name} — {d.nights || d.days} nights</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-surface-700">{cart.numberOfTravelers} traveler{cart.numberOfTravelers > 1 ? 's' : ''} · {cart.totalDays} nights</span>
              </div>
              {totalPrice > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-surface-700 font-semibold">Budget Range: {fmtRange(range.min, range.max)}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-surface-400">Redirecting in a moment…</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Share Modal ─────────────────────────────────── */
function ShareModal({ cart, onClose }) {
  const [tab, setTab] = useState('whatsapp');
  const [copied, setCopied] = useState(false);
  const totalPrice = cart.totalPrice || 0;
  const range = getRange(totalPrice);
  const text = `✈️ My Trip Plan via TravelHub\n\n📍 Route:\n${cart.destinations.map((d,i) => `  ${i+1}. ${d.name} — ${d.nights||d.days||0} nights`).join('\n')}\n\n👥 Travelers: ${cart.numberOfTravelers}\n🌙 Total Nights: ${cart.totalDays}\n💰 Estimated Budget: ${totalPrice > 0 ? fmtRange(range.min, range.max) : 'TBD'}\n\nPlan yours at TravelHub ✨`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Share Trip Plan</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          {[
            { id:'whatsapp', label:'WhatsApp', icon:MessageCircle, cls:'bg-green-500' },
            { id:'email',    label:'Email',    icon:Mail,          cls:'bg-blue-500'  },
            { id:'copy',     label:'Copy',     icon:Copy,          cls:'bg-surface-700'},
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab===t.id ? t.cls+' text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
        {tab==='whatsapp' && (
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank')}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm">
            <MessageCircle className="w-4 h-4" />Share on WhatsApp
          </button>
        )}
        {tab==='email' && (
          <button onClick={() => window.open(`mailto:?subject=My Trip Plan&body=${encodeURIComponent(text)}`,'_blank')}
            className="w-full btn-primary py-3 rounded-xl text-sm font-bold">
            Open in Mail App
          </button>
        )}
        {tab==='copy' && (
          <button onClick={copy}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm ${copied?'bg-emerald-500 text-white':'bg-surface-800 text-white hover:bg-surface-900'}`}>
            {copied ? <><CheckCheck className="w-4 h-4"/>Copied!</> : <><Copy className="w-4 h-4"/>Copy to Clipboard</>}
          </button>
        )}
      </motion.div>
    </div>
  );
}

/* ── Destination Search ──────────────────────────── */
function DestSearch({ onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [all, setAll] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { getAllDestinations().then(r => setAll(r.data.data||[])).catch(()=>{}); }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    const f = all.filter(d => d.name.toLowerCase().includes(q.toLowerCase())).slice(0,6);
    setResults(f); setOpen(f.length > 0);
  }, [q, all]);

  useEffect(() => {
    const h = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const select = (dest) => { onSelect(dest); setQ(''); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search — Goa, Bali, Kashmir, Dubai…"
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-surface-200 focus:border-primary-500 rounded-xl text-sm font-medium outline-none transition-all" />
        {q && <button onClick={() => {setQ('');setOpen(false);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"><X className="w-4 h-4"/></button>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.15}}
            className="absolute top-full mt-2 left-0 right-0 bg-white border border-surface-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {results.map(dest => (
              <button key={dest._id} onClick={() => select(dest)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors border-b border-surface-100 last:border-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-100 shrink-0">
                  {dest.image && <img src={dest.image} alt={dest.name} className="w-full h-full object-cover"/>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 text-sm">{dest.name}</p>
                  <p className="text-xs text-surface-400">{dest.country} · {dest.category}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-300 shrink-0"/>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Visual Route Timeline ───────────────────────── */
function RouteTimeline({ destinations, budgetType, onUpdateNights, onRemove }) {
  if (!destinations.length) return null;
  return (
    <div>
      {/* Departure node */}
      <div className="flex items-center gap-4 pb-2">
        <div className="flex flex-col items-center w-9 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary-900 flex items-center justify-center shadow-navy">
            <Plane className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Departure</p>
          <p className="font-semibold text-surface-800 text-sm">Your City</p>
        </div>
      </div>

      {destinations.map((dest, idx) => {
        const nights = dest.nights || dest.days || 0;
        return (
          <motion.div key={idx}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16, height: 0 }}
            transition={{ duration: 0.22, delay: idx * 0.04 }}>
            {/* Connector */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center w-9 shrink-0">
                <div className="w-0.5 flex-1 bg-gradient-to-b from-primary-300 to-primary-500 my-1" style={{minHeight:'28px'}} />
              </div>
              <div className="flex-1" />
            </div>

            {/* Destination row */}
            <div className="flex items-start gap-4 group">
              <div className="flex flex-col items-center w-9 shrink-0 pt-1.5">
                <div className="w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow ring-2 ring-primary-200" />
              </div>
              <div className="flex-1 bg-white border-2 border-surface-100 group-hover:border-primary-300 group-hover:shadow-md rounded-2xl overflow-hidden transition-all shadow-sm mb-1">
                {/* Destination image header */}
                {dest.image && (
                  <div className="w-full h-32 overflow-hidden relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-surface-900 text-sm leading-tight">{dest.name}</p>
                      {dest.country && <p className="text-[10px] text-surface-400 mt-0.5">{dest.country}</p>}
                    </div>
                    <button onClick={() => onRemove(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Night picker */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-1.5 border border-blue-200">
                      <button onClick={() => onUpdateNights(idx, Math.max(1, nights - 1))}
                        className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xs text-blue-600 hover:bg-blue-100">−</button>
                      <span className="text-sm font-bold text-surface-900 w-16 text-center">{nights} Night{nights!==1?'s':''}</span>
                      <button onClick={() => onUpdateNights(idx, nights + 1)}
                        className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xs text-blue-600 hover:bg-blue-100">+</button>
                    </div>
                    {dest.category && (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-semibold">
                        {dest.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Last connector */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center w-9 shrink-0">
          <div className="w-0.5 flex-1 bg-gradient-to-b from-primary-500 to-gold-500 my-1" style={{minHeight:'28px'}} />
        </div>
        <div className="flex-1"/>
      </div>

      {/* Return node */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center w-9 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center shadow-gold">
            <Plane className="w-4 h-4 text-white transform rotate-180" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Return</p>
          <p className="font-semibold text-surface-800 text-sm">Home</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
export default function CustomBuilder() {
  const { cart, addDestination, removeDestination, setTravelers, setBudgetType, updateCart, clearCart } = useCart();

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const budgetType = cart.budgetType || 'standard';
  const hasRoute = cart.destinations.length > 0;
  const totalPrice = cart.totalPrice || 0;
  const range = getRange(totalPrice);

  const handleSelectDest = (dest) => {
    addDestination({
      _id: dest._id, name: dest.name,
      nights: 2, days: 2,
      image: dest.image, country: dest.country, category: dest.category,
      economyPerNight:  dest.economyPerNight,
      standardPerNight: dest.standardPerNight,
      luxuryPerNight:   dest.luxuryPerNight,
      transportCharge:  dest.transportCharge,
      activitiesCharge: dest.activitiesCharge,
    });
  };

  const handlePopular = (pop) => {
    addDestination({ name: pop.name, nights: 2, days: 2, costPerDay: 4000 });
  };

  const updateNights = (idx, val) => {
    const n = Math.max(1, parseInt(val) || 1);
    const updated = cart.destinations.map((d, i) => i === idx ? { ...d, nights: n, days: n } : d);
    updateCart({ destinations: updated });
  };

  const accomRange   = getRange(cart.accommodationTotal || 0);
  const transRange   = getRange(cart.transportTotal || 0);
  const actRange     = getRange(cart.activitiesTotal || 0);

  return (
    <div className="min-h-screen bg-surface-50">

      <AnimatePresence>
        {quoteOpen && <QuoteModal cart={cart} budgetType={budgetType} onClose={() => setQuoteOpen(false)} />}
        {shareOpen && <ShareModal cart={cart} onClose={() => setShareOpen(false)} />}
      </AnimatePresence>

      {/* Page header */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Plan Your Journey</span>
            </div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl text-surface-900 mb-2">Custom Trip Builder</h1>
            <p className="text-surface-500 max-w-xl text-sm">Visualize your trip, get a budget estimate, and let our travel experts craft your perfect itinerary.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT ──────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* STEP 1: Destinations */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
                <h2 className="font-display font-bold text-base text-surface-900">Add Your Destinations</h2>
              </div>

              <DestSearch onSelect={handleSelectDest} />

              <div className="mt-4">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2.5">Popular Destinations</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(p => (
                    <button key={p.name} onClick={() => handlePopular(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 hover:bg-primary-50 border border-surface-200 hover:border-primary-300 rounded-full text-xs font-semibold text-surface-700 hover:text-primary-700 transition-all">
                      <span>{p.emoji}</span>{p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2: Route Timeline */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
                  <h2 className="font-display font-bold text-base text-surface-900">Your Route</h2>
                </div>
                {hasRoute && (
                  <span className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-bold border border-primary-100">
                    {cart.destinations.length} stop{cart.destinations.length!==1?'s':''}
                  </span>
                )}
              </div>

              {!hasRoute ? (
                <div className="text-center py-12 bg-surface-50 rounded-xl border-2 border-dashed border-surface-200">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-surface-500 font-semibold text-sm">Your route will appear here</p>
                  <p className="text-surface-400 text-xs mt-1">Add destinations above to get started</p>
                </div>
              ) : (
                <AnimatePresence>
                  <RouteTimeline
                    destinations={cart.destinations}
                    budgetType={budgetType}
                    onUpdateNights={updateNights}
                    onRemove={removeDestination}
                  />
                </AnimatePresence>
              )}
            </div>

            {/* STEP 3: Travel Details (Accordion) */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
              <button onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
                  <h2 className="font-display font-bold text-base text-surface-900">Travel Details</h2>
                  {(cart.startDate || cart.numberOfTravelers > 1) && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">Filled</span>
                  )}
                </div>
                {detailsOpen ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
              </button>

              <AnimatePresence>
                {detailsOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-100">
                      <div className="pt-4">
                        <label className="text-xs font-bold text-surface-500 block mb-1.5">Departure Date</label>
                        <input type="date" value={cart.startDate} onChange={e => updateCart({ startDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500" />
                      </div>
                      <div className="sm:pt-4">
                        <label className="text-xs font-bold text-surface-500 block mb-1.5">Return Date</label>
                        <input type="date" value={cart.endDate} onChange={e => updateCart({ endDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-surface-500 block mb-1.5">Number of Travelers</label>
                        <input type="number" min="1" value={cart.numberOfTravelers} onChange={e => setTravelers(parseInt(e.target.value)||1)}
                          className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-surface-500 block mb-1.5">Special Requests</label>
                        <textarea rows={2} value={cart.specialRequests} onChange={e => updateCart({ specialRequests: e.target.value })}
                          placeholder="Honeymoon, dietary needs…"
                          className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500 resize-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: Sticky Summary ─────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-4">

              {/* Summary card */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg border border-blue-600/30">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Trip Summary</span>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: Users,     val: cart.numberOfTravelers, label: 'Travelers' },
                    { icon: Moon,      val: cart.totalDays || 0,     label: 'Nights'    },
                    { icon: MapPin,    val: cart.destinations.length, label: 'Stops'   },
                  ].map(s => (
                    <div key={s.label} className="bg-blue-600/50 rounded-xl p-3 text-center">
                      <s.icon className="w-4 h-4 text-blue-200 mx-auto mb-1" />
                      <p className="font-display font-bold text-white text-lg leading-none">{s.val}</p>
                      <p className="text-[10px] text-blue-100 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Destinations quick list */}
                {hasRoute && (
                  <div className="mb-5 space-y-1.5">
                    {cart.destinations.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                        <span className="text-blue-100 flex-1 truncate">{d.name}</span>
                        <span className="text-blue-200 text-xs font-semibold shrink-0">{d.nights||d.days||0}N</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget Estimate — RANGES ONLY */}
                {totalPrice > 0 && (
                  <div className="border-t border-blue-600/50 pt-4 space-y-2.5">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Estimated Budget</p>

                    {cart.accommodationTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">🛏️ Accommodation</span>
                        <span className="font-semibold text-white">{fmtRange(accomRange.min, accomRange.max)}</span>
                      </div>
                    )}
                    {cart.transportTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">🚌 Transport</span>
                        <span className="font-semibold text-white">{fmtRange(transRange.min, transRange.max)}</span>
                      </div>
                    )}
                    {cart.activitiesTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">🎯 Activities</span>
                        <span className="font-semibold text-white">{fmtRange(actRange.min, actRange.max)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-blue-600/50">
                      <p className="text-xs text-blue-200 mb-1">Total Estimate</p>
                      <motion.p key={totalPrice}
                        initial={{ scale: 1.1, color: '#fbbf24' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="font-display font-extrabold text-2xl">
                        {fmtRange(range.min, range.max)}
                      </motion.p>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-1.5 mt-2 bg-blue-600/30 rounded-xl p-3">
                      <Info className="w-3.5 h-3.5 text-blue-200 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-100 leading-relaxed">
                        Budget estimate based on current market rates. Final quotation may vary depending on travel dates, hotel availability, seasonality, and selected experiences.
                      </p>
                    </div>
                  </div>
                )}

                {!hasRoute && (
                  <div className="text-center py-4">
                    <p className="text-blue-200 text-sm">Add destinations to see your estimate</p>
                  </div>
                )}
              </div>

              {/* PRIMARY CTA */}
              <motion.button
                onClick={() => setQuoteOpen(true)}
                disabled={!hasRoute}
                whileHover={{ scale: hasRoute ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-gold py-5 rounded-2xl text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-gold"
              >
                <span className="block text-base font-bold">Get My Final Quote</span>
                <span className="block text-xs font-normal mt-0.5 opacity-80">
                  Our travel experts will prepare your personalized itinerary
                </span>
              </motion.button>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShareOpen(true)} disabled={!hasRoute}
                  className="flex items-center justify-center gap-1.5 py-3 bg-white border-2 border-surface-200 hover:border-primary-300 text-surface-700 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all">
                  <Share2 className="w-3.5 h-3.5" />Share Trip
                </button>
                <button onClick={clearCart} disabled={!hasRoute}
                  className="flex items-center justify-center gap-1.5 py-3 bg-white border-2 border-surface-200 hover:border-red-200 hover:text-red-500 text-surface-500 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />Clear All
                </button>
              </div>

              {/* Trust badges */}
              <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: '⭐', val: '4.8', label: 'Rating' },
                    { icon: '👥', val: '10k+', label: 'Travelers' },
                    { icon: '🌍', val: '30+', label: 'Destinations' },
                  ].map(b => (
                    <div key={b.label}>
                      <p className="text-lg">{b.icon}</p>
                      <p className="font-display font-bold text-surface-900 text-sm">{b.val}</p>
                      <p className="text-[10px] text-surface-400">{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}