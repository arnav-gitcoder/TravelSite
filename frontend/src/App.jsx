import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Contact from './pages/Contact';
import TripPlanner from './pages/TripPlanner';
import CustomBuilder from './pages/CustomBuilder';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CustomerAuth from './pages/Auth/CustomerAuth';
import ScrollToTop from './components/common/ScrollToTop';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
          <div className="max-w-xl w-full bg-white border border-red-100 shadow-xl rounded-2xl p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600 mb-2">Something went wrong</p>
            <h1 className="text-2xl font-bold text-surface-900 mb-3">The page could not render.</h1>
            <p className="text-surface-600 mb-5">Refresh the page. If this persists, check the console.</p>
            <pre className="bg-surface-900 text-white text-xs rounded-xl p-4 overflow-auto">{this.state.error.message}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Layout wrapper — hides Navbar/Footer on admin pages ── */
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth  = pathname === '/login' || pathname === '/register';

  if (isAdmin || isAuth) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/"               element={<Home />} />
                <Route path="/packages"       element={<Packages />} />
                <Route path="/packages/:id"   element={<PackageDetails />} />
                <Route path="/contact"        element={<Contact />} />
                <Route path="/trip-planner"   element={<TripPlanner />} />
                <Route path="/custom-trip"    element={<CustomBuilder />} />
                <Route path="/login"          element={<CustomerAuth />} />
                <Route path="/register"       element={<CustomerAuth />} />
                <Route path="/admin/login"    element={<AdminLogin />} />
                <Route path="/admin"          element={<AdminDashboard />} />
                <Route path="*"              element={<NotFound />} />
              </Routes>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-surface-50">
      <div className="text-center p-8 max-w-md bg-white rounded-3xl shadow-card border border-surface-200">
        <span className="text-7xl block mb-6">✈️</span>
        <h1 className="font-display font-extrabold text-6xl text-primary-600 mb-3">404</h1>
        <p className="font-display font-semibold text-2xl text-surface-900 mb-3">Journey Lost</p>
        <p className="text-surface-500 text-sm mb-8">The path you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all">
          Return Home
        </a>
      </div>
    </div>
  );
}

function WhatsAppFloat() {
  return (
    <a href="https://wa.me/918800000000?text=Hi%2C%20I%20want%20to%20book%20a%20trip"
      target="_blank" rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110"
      title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

export default App;