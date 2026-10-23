import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/',            label: 'Home'        },
  { to: '/packages',    label: 'Packages'    },
  { to: '/custom-trip', label: 'Custom Trip' },
  { to: '/contact',     label: 'Contact'     },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      scrolled ? 'navbar-scrolled' : 'bg-white/95 border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary-900 flex items-center justify-center shadow-sm group-hover:bg-primary-800 transition-colors">
              <span className="text-sm">✈</span>
            </div>
            <span className="font-display font-bold text-lg text-primary-900 tracking-tight">
              Travel<span className="text-gradient-gold">Hub</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                }`}>
                {label}
                {isActive(to) && (
                  <motion.div layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop Auth ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              isAdmin ? (
                /* Admin actions */
                <>
                  <Link to="/admin"
                    className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-1.5 rounded-lg hover:bg-surface-50 transition-all">
                    Admin Panel
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="text-sm font-medium text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                    Logout
                  </button>
                </>
              ) : (
                /* Customer actions */
                <>
                  <span className="text-sm font-medium text-surface-600 px-3 py-1.5">
                    Hi, {user?.name?.split(' ')[0] || 'Traveler'} 👋
                  </span>
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="text-sm font-medium text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                    Sign Out
                  </button>
                </>
              )
            ) : (
              /* Logged out */
              <>
                <Link to="/login"
                  className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-1.5 transition-all">
                  Sign In
                </Link>
                <Link to="/packages" className="btn-gold text-sm px-4 py-2 rounded-lg">
                  Explore Trips
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-surface-100 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Nav links */}
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50'
                  }`}>
                  {label}
                </Link>
              ))}

              {/* Auth section */}
              <div className="pt-3 mt-2 border-t border-surface-100 space-y-2">
                {isAuthenticated ? (
                  isAdmin ? (
                    <>
                      <Link to="/admin"
                        className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50">
                        Admin Panel
                      </Link>
                      <button onClick={() => { logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-surface-500">
                        Hi, {user?.name?.split(' ')[0] || 'Traveler'} 👋
                      </div>
                      <button onClick={() => { logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <Link to="/login"
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-surface-700 hover:bg-surface-50 border border-surface-200">
                      Sign In
                    </Link>
                    <Link to="/register"
                      className="block text-center btn-gold py-3 rounded-xl text-sm font-bold">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}