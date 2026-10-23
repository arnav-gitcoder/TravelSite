import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { forgotAdminPassword, loginAdmin, resetAdminPassword } from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, login } = useAuth();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [resetData, setResetData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setResetData((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }

      const response = await loginAdmin(formData);
      login(response.data.token, response.data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.email) {
        setError('Please enter your admin email');
        setLoading(false);
        return;
      }

      const response = await forgotAdminPassword({ email: formData.email });
      setSuccess(response.data.message || 'Reset code sent to your email');
      setResetData({ otp: '', newPassword: '', confirmPassword: '' });
      setMode('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.email || !resetData.otp || !resetData.newPassword) {
        setError('Please enter email, reset code, and new password');
        setLoading(false);
        return;
      }

      if (resetData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (resetData.newPassword !== resetData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await resetAdminPassword({
        email: formData.email,
        otp: resetData.otp,
        newPassword: resetData.newPassword,
      });

      setSuccess(response.data.message || 'Password reset successfully. Please sign in.');
      setFormData((prev) => ({ ...prev, password: '' }));
      setResetData({ otp: '', newPassword: '', confirmPassword: '' });
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {mode === 'login' ? 'Admin Login' : mode === 'forgot' ? 'Reset Password' : 'Enter Reset Code'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login'
                ? 'Sign in to manage packages and bookings.'
                : mode === 'forgot'
                ? 'Enter your admin email and we will send a reset code.'
                : 'Use the code from your email to choose a new password.'}
            </p>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@travel.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@travel.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back to Login
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@travel.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Reset Code</label>
                <input
                  type="text"
                  name="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetData.otp}
                  onChange={handleResetInputChange}
                  placeholder="6-digit code"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={resetData.newPassword}
                  onChange={handleResetInputChange}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={resetData.confirmPassword}
                  onChange={handleResetInputChange}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Request New Code
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
