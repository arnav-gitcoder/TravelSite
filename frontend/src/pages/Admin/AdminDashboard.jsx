import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDashboardStats, getAllBookings, getAllDestinations,
  getAllCustomPackages, updateCustomPackageStatus,
  updateBookingStatus, createDestinationWithImage, updateDestinationWithImage,
  deleteDestination, createPackageWithImages, updatePackageWithImages,
  deletePackage, getAllPackages,
} from '../../services/api';
import Loading from '../../components/common/Loading';
import {
  LayoutDashboard, Users, BookOpen, Settings, MapPin,
  LogOut, Phone, Mail, MessageCircle, Trash2, Eye,
  X, Search, Upload, Package, Plus, Edit2, Star,
  Clock, IndianRupee, Image as ImageIcon,
} from 'lucide-react';

const STATUS_COLORS = {
  submitted: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  draft:     'bg-surface-100 text-surface-500 border-surface-200',
};

const CATEGORIES = ['Domestic','International','Honeymoon','Adventure','Luxury','Family','Cultural','Beach','Budget'];
const DIFFICULTIES = ['Easy','Moderate','Hard'];
const LEAD_STATUSES = ['submitted','confirmed','cancelled'];

const emptyPkg = {
  title:'', shortDescription:'', description:'', category:'Domestic',
  destination:'', price:'', duration:'', rating:'4.5', reviews:'0',
  difficulty:'Easy', maxGroupSize:'15', includesFood: false, includesAccommodation: true,
  highlights:'', activities:'',
};

const emptyDest = {
  name:'', country:'India', isInternational: false, category:'Beach',
  economyPerNight:2000, standardPerNight:5000, luxuryPerNight:12000,
  transportCharge:2000, activitiesCharge:2000, image:'',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats]         = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [leads, setLeads]         = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Leads
  const [selectedLead, setSelectedLead]         = useState(null);
  const [leadSearch, setLeadSearch]             = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus]     = useState(null);

  // Package form
  const [pkgForm, setPkgForm]         = useState(emptyPkg);
  const [pkgImages, setPkgImages]     = useState([]);
  const [pkgPreviews, setPkgPreviews] = useState([]);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [pkgLoading, setPkgLoading]   = useState(false);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const pkgImgRef = useRef();

  // Destination form
  const [destForm, setDestForm]           = useState(emptyDest);
  const [destImageFile, setDestImageFile] = useState(null);
  const [destPreview, setDestPreview]     = useState('');
  const [editingDestId, setEditingDestId] = useState(null);
  const [destLoading, setDestLoading]     = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return; }
    fetchAll();
  }, [isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, leadsRes, destRes, pkgRes] = await Promise.all([
        getDashboardStats().catch(() => ({ data: { data: {} } })),
        getAllBookings({ limit: 0 }).catch(() => ({ data: { data: [] } })),
        getAllCustomPackages({ limit: 0 }).catch(() => ({ data: { data: [] } })),
        getAllDestinations().catch(() => ({ data: { data: [] } })),
        getAllPackages({ limit: 0 }).catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data || {});
      setBookings(bookingsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
      setDestinations(destRes.data.data || []);
      setPackages(pkgRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Lead helpers ── */
  const getLeadName  = l => l.customerName  || l.specialRequests?.match(/Name:\s*([^|]+)/)?.[1]?.trim()  || '—';
  const getLeadPhone = l => l.customerPhone || l.specialRequests?.match(/Phone:\s*([^|]+)/)?.[1]?.trim() || '—';
  const getLeadEmail = l => l.customerEmail || l.specialRequests?.match(/Email:\s*([^|]+)/)?.[1]?.trim() || '—';

  const handleLeadStatus = async (lead, status) => {
    setUpdatingStatus(lead._id);
    try {
      await updateCustomPackageStatus(lead._id, status);
      setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status } : l));
      if (selectedLead?._id === lead._id) setSelectedLead(p => ({ ...p, status }));
    } catch { alert('Failed to update status'); }
    finally { setUpdatingStatus(null); }
  };

  const filteredLeads = leads.filter(l => {
    const s = leadSearch.toLowerCase();
    const match = !s || getLeadName(l).toLowerCase().includes(s) ||
      getLeadPhone(l).includes(s) || getLeadEmail(l).toLowerCase().includes(s) ||
      l.destinations?.some(d => d.name?.toLowerCase().includes(s));
    return match && (leadStatusFilter === 'all' || l.status === leadStatusFilter);
  });

  /* ── Package CRUD ── */
  const handlePkgImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPkgImages(files);
    setPkgPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const savePkg = async () => {
    if (!pkgForm.title || !pkgForm.price || !pkgForm.duration) {
      alert('Title, price and duration are required'); return;
    }
    setPkgLoading(true);
    try {
      const fd = new FormData();
      Object.entries(pkgForm).forEach(([k, v]) => fd.append(k, v));
      // Convert highlights/activities to arrays
      if (pkgForm.highlights) fd.set('highlights', JSON.stringify(pkgForm.highlights.split('\n').filter(Boolean)));
      if (pkgForm.activities) fd.set('activities', JSON.stringify(pkgForm.activities.split('\n').filter(Boolean)));
      pkgImages.forEach(img => fd.append('images', img));

      let res;
      if (editingPkgId) {
        res = await updatePackageWithImages(editingPkgId, fd);
        setPackages(prev => prev.map(p => p._id === editingPkgId ? res.data.data : p));
      } else {
        res = await createPackageWithImages(fd);
        setPackages(prev => [res.data.data, ...prev]);
      }
      resetPkgForm();
    } catch (e) { alert(e.response?.data?.message || 'Failed to save package'); }
    finally { setPkgLoading(false); }
  };

  const resetPkgForm = () => {
    setPkgForm(emptyPkg); setPkgImages([]); setPkgPreviews([]);
    setEditingPkgId(null); setShowPkgForm(false);
  };

  const editPkg = (pkg) => {
    setPkgForm({
      title: pkg.title || '', shortDescription: pkg.shortDescription || '',
      description: pkg.description || '', category: pkg.category || 'Domestic',
      destination: pkg.destination || '', price: pkg.price || '',
      duration: pkg.duration || '', rating: pkg.rating || '4.5',
      reviews: pkg.reviews || '0', difficulty: pkg.difficulty || 'Easy',
      maxGroupSize: pkg.maxGroupSize || '15',
      includesFood: pkg.includesFood || false,
      includesAccommodation: pkg.includesAccommodation !== false,
      highlights: Array.isArray(pkg.highlights) ? pkg.highlights.join('\n') : '',
      activities: Array.isArray(pkg.activities) ? pkg.activities.join('\n') : '',
    });
    setPkgPreviews(pkg.images || []);
    setEditingPkgId(pkg._id);
    setShowPkgForm(true);
    window.scrollTo(0, 0);
  };

  const deletePkg = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await deletePackage(id);
      setPackages(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete'); }
  };

  /* ── Destination CRUD ── */
  const saveDest = async () => {
    if (!destForm.name) { alert('Name required'); return; }
    setDestLoading(true);
    try {
      const fd = new FormData();
      Object.entries(destForm).forEach(([k, v]) => fd.append(k, v));
      if (destImageFile) fd.append('image', destImageFile);
      let res;
      if (editingDestId) {
        res = await updateDestinationWithImage(editingDestId, fd);
        setDestinations(prev => prev.map(d => d._id === editingDestId ? res.data.data : d));
      } else {
        res = await createDestinationWithImage(fd);
        setDestinations(prev => [...prev, res.data.data]);
      }
      setDestForm(emptyDest); setDestImageFile(null); setDestPreview(''); setEditingDestId(null);
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
    finally { setDestLoading(false); }
  };

  const SIDEBAR = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'leads',        icon: Users,           label: `Leads${leads.length ? ` (${leads.length})` : ''}` },
    { id: 'packages',     icon: Package,         label: 'Packages' },
    { id: 'bookings',     icon: BookOpen,        label: 'Bookings' },
    { id: 'destinations', icon: MapPin,          label: 'Destinations' },
    { id: 'settings',     icon: Settings,        label: 'Settings' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-primary-900 flex flex-col shrink-0 min-h-screen">
        <div className="p-5 border-b border-primary-800">
          <p className="text-white font-bold text-lg">TravelHub</p>
          <p className="text-primary-300 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setShowPkgForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-white text-primary-900' : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`}>
              <Icon className="w-4 h-4 shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-primary-400 text-[10px]">{user?.role || 'admin'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 text-xs font-medium transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto p-6">

        {/* ════ DASHBOARD ════ */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="font-bold text-2xl text-surface-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Packages',     val: packages.length,                            color: 'bg-blue-50 text-blue-700' },
                { label: 'Trip Leads',   val: leads.length,                               color: 'bg-violet-50 text-violet-700' },
                { label: 'Bookings',     val: bookings.length,                            color: 'bg-amber-50 text-amber-700' },
                { label: 'Revenue',      val: `₹${((stats?.totalRevenue||0)/1000).toFixed(0)}k`, color: 'bg-emerald-50 text-emerald-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-5`}>
                  <p className="text-2xl font-extrabold">{s.val}</p>
                  <p className="text-sm opacity-70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <h2 className="font-bold text-lg mb-3">Recent Leads</h2>
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>{['Customer','Destinations','Travelers','Status','Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {leads.slice(0,5).map(l => (
                    <tr key={l._id} className="hover:bg-surface-50 cursor-pointer" onClick={() => { setSelectedLead(l); setActiveTab('leads'); }}>
                      <td className="px-4 py-3 font-semibold">{getLeadName(l)}</td>
                      <td className="px-4 py-3 text-surface-500 text-xs">{l.destinations?.map(d=>d.name).join(', ')}</td>
                      <td className="px-4 py-3">{l.numberOfTravelers}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[l.status]||STATUS_COLORS.submitted}`}>{l.status}</span></td>
                      <td className="px-4 py-3 text-surface-400 text-xs">{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ LEADS ════ */}
        {activeTab === 'leads' && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="font-bold text-2xl text-surface-900">Trip Leads</h1>
                  <p className="text-surface-400 text-sm mt-0.5">Customers who requested a custom trip quote</p>
                </div>
                <span className="text-primary-600 font-bold text-sm">{filteredLeads.length} leads</span>
              </div>
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                    placeholder="Search by name, phone, email, destination..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none font-medium">
                  <option value="all">All Status</option>
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredLeads.map(lead => (
                  <div key={lead._id} onClick={() => setSelectedLead(lead)}
                    className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${selectedLead?._id === lead._id ? 'border-primary-400' : 'border-surface-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">
                          {getLeadName(lead)[0]?.toUpperCase() || '—'}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{getLeadName(lead)}</p>
                          <p className="text-surface-400 text-xs">{new Date(lead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[lead.status]||STATUS_COLORS.submitted}`}>
                        {lead.status?.charAt(0).toUpperCase()+lead.status?.slice(1)}
                      </span>
                    </div>
                    {getLeadPhone(lead)!=='—' && <p className="flex items-center gap-1.5 text-xs text-surface-500 mb-1"><Phone className="w-3 h-3" />{getLeadPhone(lead)}</p>}
                    {getLeadEmail(lead)!=='—' && <p className="flex items-center gap-1.5 text-xs text-surface-500 mb-3"><Mail className="w-3 h-3" />{getLeadEmail(lead)}</p>}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {lead.destinations?.map((d,i) => (
                        <span key={i} className="flex items-center gap-1 bg-surface-50 border border-surface-100 text-surface-600 px-2 py-0.5 rounded-full text-xs">
                          <MapPin className="w-2.5 h-2.5" />{d.name}·{d.days}N
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-surface-400">{lead.numberOfTravelers} travelers · {lead.totalDays} nights</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={e=>{e.stopPropagation();setSelectedLead(lead);}}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-surface-200 rounded-xl text-xs font-semibold text-surface-600 hover:bg-surface-50">
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                      <a href={`https://wa.me/${getLeadPhone(lead).replace(/\D/g,'')}?text=Hi ${getLeadName(lead)}, regarding your trip to ${lead.destinations?.map(d=>d.name).join(', ')}`}
                        target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold">
                        <MessageCircle className="w-3.5 h-3.5" /> WA
                      </a>
                      <a href={`mailto:${getLeadEmail(lead)}?subject=Your Custom Trip Request`} onClick={e=>e.stopPropagation()}
                        className="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold">
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
                {filteredLeads.length===0 && (
                  <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-surface-100 text-surface-400">
                    <p className="text-4xl mb-3">📭</p><p className="font-semibold">No leads found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail panel */}
            {selectedLead && (
              <div className="w-80 shrink-0">
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card sticky top-0 overflow-hidden">
                  <div className="bg-primary-900 p-5 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{getLeadName(selectedLead)}</p>
                      <p className="text-primary-300 text-xs mt-0.5">{new Date(selectedLead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                    <button onClick={()=>setSelectedLead(null)} className="text-primary-300 hover:text-white"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {[{icon:Phone,label:'Phone',val:getLeadPhone(selectedLead)},{icon:MessageCircle,label:'WhatsApp',val:getLeadPhone(selectedLead)},{icon:Mail,label:'Email',val:getLeadEmail(selectedLead)}].map(({icon:Icon,label,val})=>(
                      <div key={label} className="flex items-center gap-3 bg-surface-50 rounded-xl p-3">
                        <Icon className="w-4 h-4 text-primary-500 shrink-0"/>
                        <div><p className="text-[10px] text-surface-400 font-bold uppercase tracking-wide">{label}</p><p className="text-sm font-semibold text-surface-800">{val}</p></div>
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Trip Details</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[{val:selectedLead.numberOfTravelers,label:'Travelers'},{val:selectedLead.totalDays,label:'Nights'},{val:new Date(selectedLead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),label:'Submitted'}].map(s=>(
                          <div key={s.label} className="bg-primary-50 rounded-xl p-3 text-center">
                            <p className="font-bold text-primary-700 text-base">{s.val}</p>
                            <p className="text-[10px] text-primary-400">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {selectedLead.destinations?.map((d,i)=>(
                          <div key={i} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg">
                            <span className="flex items-center gap-2 text-sm text-surface-700 font-medium"><MapPin className="w-3.5 h-3.5 text-primary-400"/>{d.name}</span>
                            <span className="text-xs text-surface-400">{d.days} nights</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Update Status</p>
                      <div className="flex gap-2">
                        {LEAD_STATUSES.map(s=>(
                          <button key={s} onClick={()=>handleLeadStatus(selectedLead,s)} disabled={updatingStatus===selectedLead._id}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border-2 transition-all ${selectedLead.status===s?s==='confirmed'?'bg-emerald-500 text-white border-emerald-500':s==='cancelled'?'bg-red-500 text-white border-red-500':'bg-amber-500 text-white border-amber-500':'bg-white text-surface-500 border-surface-200 hover:border-primary-300'}`}>
                            {updatingStatus===selectedLead._id?'…':s.charAt(0).toUpperCase()+s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <a href={`https://wa.me/${getLeadPhone(selectedLead).replace(/\D/g,'')}?text=Hi ${getLeadName(selectedLead)}, we received your trip request!`} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm">
                        <MessageCircle className="w-4 h-4"/>WhatsApp
                      </a>
                      <a href={`mailto:${getLeadEmail(selectedLead)}?subject=Your Custom Trip`}
                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm">
                        <Mail className="w-4 h-4"/>Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ PACKAGES ════ */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-bold text-2xl text-surface-900">Packages</h1>
              <button onClick={() => { resetPkgForm(); setShowPkgForm(true); }}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                <Plus className="w-4 h-4" /> Add Package
              </button>
            </div>

            {/* Package Form */}
            {showPkgForm && (
              <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg text-surface-900">{editingPkgId ? 'Edit Package' : 'Add New Package'}</h3>
                  <button onClick={resetPkgForm} className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200">
                    <X className="w-4 h-4 text-surface-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Package Title *</label>
                    <input value={pkgForm.title} onChange={e=>setPkgForm(p=>({...p,title:e.target.value}))}
                      placeholder="e.g. Kashmir Paradise 7N/8D" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Destination *</label>
                    <input value={pkgForm.destination} onChange={e=>setPkgForm(p=>({...p,destination:e.target.value}))}
                      placeholder="e.g. Kashmir, India" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Category *</label>
                    <select value={pkgForm.category} onChange={e=>setPkgForm(p=>({...p,category:e.target.value}))}
                      className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Price (₹) *</label>
                    <input type="number" value={pkgForm.price} onChange={e=>setPkgForm(p=>({...p,price:e.target.value}))}
                      placeholder="25000" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Duration (Days) *</label>
                    <input type="number" value={pkgForm.duration} onChange={e=>setPkgForm(p=>({...p,duration:e.target.value}))}
                      placeholder="7" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Difficulty</label>
                    <select value={pkgForm.difficulty} onChange={e=>setPkgForm(p=>({...p,difficulty:e.target.value}))}
                      className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                      {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Max Group Size</label>
                    <input type="number" value={pkgForm.maxGroupSize} onChange={e=>setPkgForm(p=>({...p,maxGroupSize:e.target.value}))}
                      placeholder="15" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Rating</label>
                    <input type="number" step="0.1" min="1" max="5" value={pkgForm.rating} onChange={e=>setPkgForm(p=>({...p,rating:e.target.value}))}
                      placeholder="4.5" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Short Description</label>
                    <input value={pkgForm.shortDescription} onChange={e=>setPkgForm(p=>({...p,shortDescription:e.target.value}))}
                      placeholder="One line summary shown on cards" className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Full Description</label>
                    <textarea value={pkgForm.description} onChange={e=>setPkgForm(p=>({...p,description:e.target.value}))} rows={3}
                      placeholder="Detailed description of the package..." className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Highlights (one per line)</label>
                    <textarea value={pkgForm.highlights} onChange={e=>setPkgForm(p=>({...p,highlights:e.target.value}))} rows={4}
                      placeholder={"Dal Lake Houseboat\nGulmarg Gondola\nPahalgam Valley"} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-1.5">Activities (one per line)</label>
                    <textarea value={pkgForm.activities} onChange={e=>setPkgForm(p=>({...p,activities:e.target.value}))} rows={4}
                      placeholder={"Shikara Ride\nSkiing\nTrekking"} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
                  </div>
                  <div className="md:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pkgForm.includesAccommodation} onChange={e=>setPkgForm(p=>({...p,includesAccommodation:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600"/>
                      <span className="text-sm font-medium text-surface-700">Includes Accommodation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pkgForm.includesFood} onChange={e=>setPkgForm(p=>({...p,includesFood:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600"/>
                      <span className="text-sm font-medium text-surface-700">Includes Food</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">Package Images (up to 5)</label>
                  <div onClick={()=>pkgImgRef.current?.click()}
                    className="border-2 border-dashed border-surface-200 hover:border-primary-400 rounded-xl p-6 text-center cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                    <p className="text-sm text-surface-500 font-medium">Click to upload images</p>
                    <p className="text-xs text-surface-400 mt-1">JPG, PNG, WebP, AVIF up to 15MB each</p>
                    <input ref={pkgImgRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePkgImageChange} />
                  </div>
                  {pkgPreviews.length > 0 && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {pkgPreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img src={src} className="w-24 h-20 object-cover rounded-xl border border-surface-200" alt="" />
                          <button onClick={() => { setPkgPreviews(p=>p.filter((_,j)=>j!==i)); setPkgImages(p=>p.filter((_,j)=>j!==i)); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={savePkg} disabled={pkgLoading}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all">
                    {pkgLoading ? 'Saving…' : editingPkgId ? 'Update Package' : 'Create Package'}
                  </button>
                  <button onClick={resetPkgForm} className="border border-surface-200 text-surface-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-surface-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Package list */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <div key={pkg._id} className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden group">
                  <div className="relative h-40 overflow-hidden bg-surface-100">
                    {pkg.images?.[0]
                      ? <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-surface-300" /></div>
                    }
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold text-primary-700">{pkg.category}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-surface-900 text-sm mb-1 line-clamp-1">{pkg.title}</h3>
                    <p className="text-xs text-surface-400 mb-2 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{pkg.duration}D</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{pkg.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{pkg.destination}</span>
                    </p>
                    <p className="font-extrabold text-primary-600 text-lg flex items-center mb-3">
                      <IndianRupee className="w-4 h-4"/>{pkg.price?.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-surface-400 ml-1">/person</span>
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => editPkg(pkg)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-bold transition-all">
                        <Edit2 className="w-3.5 h-3.5"/> Edit
                      </button>
                      <button onClick={() => deletePkg(pkg._id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs transition-all">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {packages.length === 0 && !showPkgForm && (
                <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-surface-200 text-surface-400">
                  <Package className="w-10 h-10 mx-auto mb-3 text-surface-200" />
                  <p className="font-semibold mb-2">No packages yet</p>
                  <button onClick={()=>setShowPkgForm(true)} className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-700">
                    + Add First Package
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ BOOKINGS ════ */}
        {activeTab === 'bookings' && (
          <div>
            <h1 className="font-bold text-2xl text-surface-900 mb-6">Bookings</h1>
            <div className="bg-white rounded-2xl border border-surface-100 overflow-x-auto shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>{['Customer','Package','Travelers','Date','Price','Status'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {bookings.map(b=>(
                    <tr key={b._id} className="hover:bg-surface-50">
                      <td className="px-4 py-3"><p className="font-semibold">{b.customerName}</p><p className="text-xs text-surface-400">{b.customerEmail}</p></td>
                      <td className="px-4 py-3 text-surface-600 text-xs">{b.packageTitle}</td>
                      <td className="px-4 py-3">{b.numberOfTravelers}</td>
                      <td className="px-4 py-3 text-surface-400 text-xs">{new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={async e=>{await updateBookingStatus(b._id,e.target.value);setBookings(prev=>prev.map(x=>x._id===b._id?{...x,status:e.target.value}:x));}}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[b.status]||''} cursor-pointer`}>
                          {['pending','confirmed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length===0&&<tr><td colSpan={6} className="px-4 py-12 text-center text-surface-400">No bookings yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ DESTINATIONS ════ */}
        {activeTab === 'destinations' && (
          <div>
            <h1 className="font-bold text-2xl text-surface-900 mb-6">Manage Destinations</h1>
            <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">{editingDestId?'Edit':'Add New'} Destination</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <input placeholder="Name *" value={destForm.name} onChange={e=>setDestForm(p=>({...p,name:e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <input placeholder="Country" value={destForm.country} onChange={e=>setDestForm(p=>({...p,country:e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <select value={destForm.category} onChange={e=>setDestForm(p=>({...p,category:e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  {['Beach','Mountain','City','Cultural','Adventure','Honeymoon','Family'].map(c=><option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Economy/Night ₹" value={destForm.economyPerNight} onChange={e=>setDestForm(p=>({...p,economyPerNight:+e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <input type="number" placeholder="Standard/Night ₹" value={destForm.standardPerNight} onChange={e=>setDestForm(p=>({...p,standardPerNight:+e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <input type="number" placeholder="Luxury/Night ₹" value={destForm.luxuryPerNight} onChange={e=>setDestForm(p=>({...p,luxuryPerNight:+e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <input type="number" placeholder="Transport ₹" value={destForm.transportCharge} onChange={e=>setDestForm(p=>({...p,transportCharge:+e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <input type="number" placeholder="Activities ₹" value={destForm.activitiesCharge} onChange={e=>setDestForm(p=>({...p,activitiesCharge:+e.target.value}))} className="border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"/>
                <div>
                  <label className="flex items-center gap-2 border-2 border-dashed border-surface-200 hover:border-primary-400 rounded-xl px-4 py-3 text-sm text-surface-500 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-primary-400 shrink-0"/>
                    {destImageFile ? destImageFile.name : 'Upload image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files[0];if(!f)return;setDestImageFile(f);setDestPreview(URL.createObjectURL(f));}}/>
                  </label>
                  {destPreview && <img src={destPreview} className="mt-2 h-16 rounded-xl object-cover" alt="preview"/>}
                  {!destImageFile && <input placeholder="Or paste image URL" value={destForm.image} onChange={e=>setDestForm(p=>({...p,image:e.target.value}))} className="mt-2 w-full border border-surface-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"/>}
                </div>
                <label className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer">
                  <input type="checkbox" checked={destForm.isInternational} onChange={e=>setDestForm(p=>({...p,isInternational:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600"/>
                  International destination
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={saveDest} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
                  {destLoading?'Saving…':editingDestId?'Update':'Add Destination'}
                </button>
                {editingDestId && <button onClick={()=>{setEditingDestId(null);setDestForm(emptyDest);setDestImageFile(null);setDestPreview('');}} className="border border-surface-200 text-surface-600 px-6 py-2.5 rounded-xl text-sm hover:bg-surface-50">Cancel</button>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>{['Destination','Category','Economy/N','Standard/N','Luxury/N','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {destinations.map(d=>(
                    <tr key={d._id} className="hover:bg-surface-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {d.image && <img src={d.image} className="w-10 h-10 rounded-lg object-cover shrink-0" alt=""/>}
                          <div><p className="font-semibold">{d.name}</p><p className="text-xs text-surface-400">{d.country}·{d.isInternational?'Intl':'India'}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-semibold">{d.category}</span></td>
                      <td className="px-4 py-3 font-medium">₹{d.economyPerNight?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium">₹{d.standardPerNight?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium">₹{d.luxuryPerNight?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>{setEditingDestId(d._id);setDestForm({name:d.name,country:d.country||'India',isInternational:d.isInternational||false,category:d.category||'Beach',economyPerNight:d.economyPerNight||2000,standardPerNight:d.standardPerNight||5000,luxuryPerNight:d.luxuryPerNight||12000,transportCharge:d.transportCharge||2000,activitiesCharge:d.activitiesCharge||2000,image:d.image||''});setDestPreview(d.image||'');}} className="text-primary-600 font-semibold text-xs mr-3 hover:text-primary-800">Edit</button>
                        <button onClick={async()=>{if(!window.confirm(`Delete ${d.name}?`))return;await deleteDestination(d._id);setDestinations(p=>p.filter(x=>x._id!==d._id));}} className="text-red-500 font-semibold text-xs hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {destinations.length===0&&<tr><td colSpan={6} className="px-4 py-10 text-center text-surface-400">No destinations yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {activeTab === 'settings' && (
          <div>
            <h1 className="font-bold text-2xl text-surface-900 mb-6">Settings</h1>
            <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6 max-w-md">
              <p className="text-surface-500 text-sm">Admin: <strong>{user?.name}</strong></p>
              <p className="text-surface-500 text-sm mt-1">Email: <strong>{user?.email}</strong></p>
              <p className="text-surface-500 text-sm mt-1">Role: <strong>{user?.role}</strong></p>
              <button onClick={()=>{logout();navigate('/');}} className="mt-5 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Logout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}