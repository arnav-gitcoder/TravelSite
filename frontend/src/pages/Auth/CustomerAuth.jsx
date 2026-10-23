import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { registerUser, verifyUserOTP, resendUserOTP, loginUser, forgotPassword, resetPassword } from '../../services/api';
import { Mail, Lock, User, Phone, Eye, EyeOff, Plane, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';

// mode: 'login' | 'register' | 'otp' | 'forgot' | 'reset-otp' | 'reset-pwd'
export default function CustomerAuth() {
  const navigate = useNavigate();
  const { loginCustomer } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const startCooldown = () => {
    setResendCooldown(30);
    const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next); setError('');
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); };
  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { setOtp(text.split('')); otpRefs.current[5]?.focus(); }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setPendingEmail(form.email); setMode('otp'); startCooldown();
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  // Verify OTP (register)
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyUserOTP({ email: pendingEmail, otp: code });
      if (res.data.success) { loginCustomer(res.data.token, res.data.user); navigate('/'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']); otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  // Verify OTP (reset password) — save code before clearing boxes
  const handleVerifyResetOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      setResetOtpCode(code);           // persist before clearing
      setMode('reset-pwd');
      setOtp(['', '', '', '', '', '']);
    } catch { setError('Invalid OTP'); }
    finally { setLoading(false); }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      if (res.data.success) { loginCustomer(res.data.token, res.data.user); navigate('/'); }
    } catch (err) { setError(err.response?.data?.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  // Forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await forgotPassword({ email: form.email });
      setPendingEmail(form.email);
      setSuccess('Reset code sent! Check your email.');
      setMode('reset-otp'); setOtp(['', '', '', '', '', '']); startCooldown();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Backend server is not running. Start the backend with: cd backend && npm run dev'
      );
    }
    finally { setLoading(false); }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    if (newPwd !== confirmNewPwd) { setError('Passwords do not match'); return; }
    if (newPwd.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await resetPassword({ email: pendingEmail, otp: resetOtpCode, newPassword: newPwd });
      if (res.data.success) {
        setSuccess('Password reset! Please login.');
        setTimeout(() => {
          set('email', pendingEmail);  // pre-fill email for convenience
          setNewPwd(''); setConfirmNewPwd(''); setResetOtpCode('');
          setMode('login'); setSuccess('');
        }, 2000);
      }
    } catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      const isReset = mode === 'reset-otp';
      await resendUserOTP({ email: pendingEmail, name: form.name, type: isReset ? 'reset' : 'register' });
      setOtp(['', '', '', '', '', '']); otpRefs.current[0]?.focus(); startCooldown();
    } catch { setError('Failed to resend'); }
    finally { setResending(false); }
  };

  const inp = 'w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary-500 transition-all';

  const OTPBoxes = ({ onVerify, onBack, title, subtitle }) => (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 mb-5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="font-display font-bold text-xl text-surface-900">{title}</h2>
        <p className="text-surface-500 text-sm mt-1.5">Code sent to <strong className="text-surface-800">{pendingEmail}</strong></p>
        {subtitle && <p className="text-surface-400 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="flex justify-center gap-2 sm:gap-3 mb-5" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input key={i} ref={el => otpRefs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKey(i, e)}
            className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${digit ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 bg-surface-50'} focus:border-primary-500`}
          />
        ))}
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center mb-4">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm text-center mb-4">{success}</div>}
      <button onClick={onVerify} disabled={loading || otp.join('').length < 6}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-4">
        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying…</> : 'Verify Code'}
      </button>
      <div className="text-center">
        <p className="text-surface-400 text-xs mb-2">Didn't receive the code?</p>
        <button onClick={handleResend} disabled={resendCooldown > 0 || resending}
          className="flex items-center gap-1.5 mx-auto text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:text-surface-400 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-primary-900">TravelHub</span>
          </Link>
          <p className="text-surface-500 text-sm mt-2">Your journey starts here</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">

          {/* OTP — Register */}
          {mode === 'otp' && (
            <OTPBoxes
              title="Check Your Email"
              subtitle="Enter the 6-digit verification code"
              onVerify={handleVerifyOTP}
              onBack={() => setMode('register')}
            />
          )}

          {/* OTP — Reset Password */}
          {mode === 'reset-otp' && (
            <OTPBoxes
              title="Password Reset Code"
              subtitle="Enter the code to continue"
              onVerify={handleVerifyResetOTP}
              onBack={() => setMode('forgot')}
            />
          )}

          {/* Reset Password form */}
          {mode === 'reset-pwd' && (
            <div className="p-6">
              <button onClick={() => setMode('forgot')} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h2 className="font-display font-bold text-xl text-surface-900 mb-1">Set New Password</h2>
              <p className="text-surface-500 text-sm mb-5">Choose a strong password for your account.</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => { setNewPwd(e.target.value); setError(''); }}
                      placeholder="Min 6 characters" className={`${inp} pr-10`} required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type={showPwd ? 'text' : 'password'} value={confirmNewPwd} onChange={e => { setConfirmNewPwd(e.target.value); setError(''); }}
                      placeholder="Repeat password" className={inp} required />
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{success}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting…</> : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password form */}
          {mode === 'forgot' && (
            <div className="p-6">
              <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="font-display font-bold text-xl text-surface-900">Forgot Password?</h2>
                <p className="text-surface-500 text-sm mt-1.5">Enter your email and we'll send a reset code.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-surface-600 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="rahul@example.com" className={inp} required />
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{success}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</> : 'Send Reset Code'}
                </button>
              </form>
            </div>
          )}

          {/* Login / Register tabs */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="flex border-b border-surface-100">
                {[['login', 'Sign In'], ['register', 'Create Account']].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                    className={`flex-1 py-4 text-sm font-bold transition-all ${mode === m ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50' : 'text-surface-500 hover:text-surface-700'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.form key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                    onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">

                    {mode === 'register' && (
                      <div>
                        <label className="text-xs font-bold text-surface-600 block mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" className={inp} required />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-surface-600 block mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@example.com" className={inp} required />
                      </div>
                    </div>

                    {mode === 'register' && (
                      <div>
                        <label className="text-xs font-bold text-surface-600 block mb-1.5">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={inp} />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-surface-600 block mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                          placeholder="Min 6 characters" className={`${inp} pr-10`} required />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === 'register' && (
                      <div>
                        <label className="text-xs font-bold text-surface-600 block mb-1.5">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                          <input type={showPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                            placeholder="Repeat password" className={inp} required />
                        </div>
                      </div>
                    )}

                    {mode === 'login' && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
                    {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{success}</div>}

                    <button type="submit" disabled={loading}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Please wait…</>
                        : mode === 'login' ? 'Sign In' : 'Send Verification Code'}
                    </button>
                  </motion.form>
                </AnimatePresence>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-surface-100" />
                  <span className="text-xs text-surface-400">or</span>
                  <div className="flex-1 h-px bg-surface-100" />
                </div>
                <p className="text-center text-xs text-surface-400">
                  Are you an admin?{' '}
                  <Link to="/admin/login" className="text-primary-600 font-bold hover:underline">Admin Login →</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
