import React, { useState } from 'react';
import { submitContact } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name || !formData.email || !formData.message) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await submitContact(formData);

      if (response.data.success) {
        setSuccess(response.data.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 border border-surface-200/40">
          <div className="max-w-3xl mb-12">
            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-surface-900 mb-3">Get In Touch</h1>
            <p className="text-surface-500 text-lg">
              Have questions about our packages? Want to arrange a custom trip? We'd love to hear from you and design your perfect getaway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            {/* Contact Info (2 cols) */}
            <div className="lg:col-span-2 space-y-8">
              <h3 className="font-display font-bold text-xl text-surface-900 uppercase tracking-wider mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-primary-100">
                    📧
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-surface-800 mb-1">Email</h4>
                    <a href="mailto:info@travelhub.com" className="text-primary-600 hover:text-primary-700 font-medium text-sm transition">
                      info@travelhub.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-primary-100">
                    📞
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-surface-800 mb-1">Phone</h4>
                    <a href="tel:+15551234567" className="text-primary-600 hover:text-primary-700 font-medium text-sm transition">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-primary-100">
                    📍
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-surface-800 mb-1">Address</h4>
                    <p className="text-surface-600 text-sm leading-relaxed">
                      123 Travel Street<br />
                      Adventure City, AC 12345<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-primary-100">
                    ⏰
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-surface-800 mb-1">Hours</h4>
                    <p className="text-surface-600 text-sm leading-relaxed">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (3 cols) */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5 bg-surface-50/50 p-6 sm:p-8 rounded-3xl border border-surface-200/30">
                <h3 className="font-display font-bold text-xl text-surface-900 mb-4">Send a Message</h3>
                
                {error && <div className="p-4 bg-red-50 text-red-700 border border-red-150 rounded-xl text-sm font-medium">{error}</div>}
                {success && <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-xl text-sm font-medium">{success}</div>}

                <div>
                  <label className="block text-surface-700 font-semibold mb-2 text-sm">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-surface-700 font-semibold mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-surface-700 font-semibold mb-2 text-sm">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your next dream vacation..."
                    rows="5"
                    required
                    className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-100 transition-all duration-300 disabled:bg-surface-300 text-sm"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Map Mockup */}
          <div className="border-t border-surface-200/60 pt-10 mt-12">
            <h3 className="font-display font-bold text-xl text-surface-900 mb-6">Our Headquarters</h3>
            <div className="bg-surface-100 h-72 rounded-3xl flex flex-col items-center justify-center border border-surface-200/50 relative overflow-hidden">
              {/* Decorative grid pattern mimicking map */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <span className="text-2xl sm:text-3xl relative z-10 mb-2">🏢</span>
              <p className="text-surface-600 font-semibold text-sm relative z-10">TravelHub Global Headquarters Office</p>
              <p className="text-surface-400 text-xs mt-1 relative z-10">123 Travel Street, Adventure City, AC 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}