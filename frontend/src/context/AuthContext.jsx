import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyAdminToken, getUserMe } from '../services/api';

const AuthContext = createContext();

/* ── token helpers ─────────────────────────── */
const store   = (key, val) => { try { localStorage.setItem(key, val); } catch {} };
const retrieve = (key)     => { try { return localStorage.getItem(key); } catch { return null; } };
const remove   = (key)     => { try { localStorage.removeItem(key); } catch {} };

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = retrieve('adminToken');
    const userToken  = retrieve('userToken');
    if      (adminToken) verifyAdmin();
    else if (userToken)  verifyUser();
    else setLoading(false);
  }, []);

  /* ── admin verify ───────────────────────── */
  const verifyAdmin = async () => {
    try {
      const res = await verifyAdminToken();
      setUser({ ...res.data.user, role: res.data.user.role || 'admin' });
      setIsAuthenticated(true);
    } catch {
      remove('adminToken');
    } finally { setLoading(false); }
  };

  /* ── customer verify ────────────────────── */
  const verifyUser = async () => {
    try {
      const res = await getUserMe();
      setUser({ ...res.data.user, role: 'customer' });
      setIsAuthenticated(true);
    } catch {
      remove('userToken');
    } finally { setLoading(false); }
  };

  /* ── login (admin) ──────────────────────── */
  const login = (token, userData) => {
    store('adminToken', token);
    remove('userToken');
    setUser({ ...userData, role: userData.role || 'admin' });
    setIsAuthenticated(true);
  };

  /* ── login (customer) ───────────────────── */
  const loginCustomer = (token, userData) => {
    store('userToken', token);
    remove('adminToken');
    setUser({ ...userData, role: 'customer' });
    setIsAuthenticated(true);
  };

  /* ── logout ─────────────────────────────── */
  const logout = () => {
    remove('adminToken');
    remove('userToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin    = isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin');
  const isCustomer = isAuthenticated && user?.role === 'customer';

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, loading,
      login, loginCustomer, logout,
      isAdmin, isCustomer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;