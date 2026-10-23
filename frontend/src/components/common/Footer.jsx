import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowRight, Plane, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-950 text-white relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-2xl group inline-flex">
              <span className="inline-block transform group-hover:rotate-12 transition-transform duration-300">✈️</span>
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
                TravelHub
              </span>
            </Link>
            <p className="text-surface-400 text-sm mt-5 leading-relaxed max-w-sm">
              Crafting extraordinary travel experiences for over a decade. From luxury escapes to adventure expeditions, we make every journey unforgettable.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {['FB', 'TW', 'IG', 'YT'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-surface-800/80 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 text-xs text-surface-300 hover:text-white hover:shadow-lg hover:shadow-primary-600/20 hover:-translate-y-0.5"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Packages', to: '/packages' },
                { label: 'Plan Trip', to: '/trip-planner' },
                { label: 'Custom Build', to: '/custom-trip' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group text-surface-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-6">
              Categories
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: 'Adventure', to: '/packages?category=Adventure' },
                { label: 'Family', to: '/packages?category=Family' },
                { label: 'Luxury', to: '/packages?category=Luxury' },
                { label: 'Budget', to: '/packages?category=Budget' },
                { label: 'Honeymoon', to: '/packages?category=Honeymoon' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group text-surface-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-6">
              Get In Touch
            </h4>

            <div className="space-y-4 mb-8">
              <p className="text-surface-400 text-sm flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-surface-800/80 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary-400" />
                </span>
                info@travelhub.com
              </p>
              <p className="text-surface-400 text-sm flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-surface-800/80 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary-400" />
                </span>
                +1 (555) 123-4567
              </p>
              <p className="text-surface-400 text-sm flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-surface-800/80 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </span>
                123 Travel Street, NYC
              </p>
            </div>

            {/* Newsletter */}
            <div className="bg-surface-900/50 rounded-2xl p-5 border border-surface-800/50">
              <p className="font-display font-semibold text-sm text-white mb-1">
                Subscribe to Newsletter
              </p>
              <p className="text-surface-500 text-xs mb-4">
                Get exclusive deals & travel inspiration
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-600/20 text-sm shrink-0 hover:shadow-primary-600/30"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-800/50 py-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-surface-500 text-sm">
            © {currentYear} TravelHub. All rights reserved.
          </p>
          <p className="text-surface-600 text-xs flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
