import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTripThemes, getAllDestinations } from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/common/Loading';

const TRIP_TYPES = [
  'Honeymoon',
  'Family',
  'Adventure',
  'Cultural',
  'Beach',
  'Budget',
  'Luxury',
  'Solo',
];

export default function TripPlanner() {
  const navigate = useNavigate();

  const { addDestination, setTravelers, updateCart, cart } = useCart();

  const [themes, setThemes] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  const [priceRange, setPriceRange] = useState({
    minPrice: 0,
    maxPrice: 0,
    avgPrice: 0,
  });

  const [formData, setFormData] = useState({
    startLocation: 'Delhi, India',
    destination: '',
    travelers: 2,
    nights: 5,
    startDate: '',
    endDate: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, destRes] = await Promise.all([
          getAllTripThemes(),
          getAllDestinations(),
        ]);

        setThemes(themesRes.data.data);
        setDestinations(destRes.data.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);

    setSelectedDestinations([]);

    setPriceRange({
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
    });
  };

  const toggleDestination = (destination) => {
    const exists = selectedDestinations.find(
      (d) => d._id === destination._id
    );

    if (exists) {
      setSelectedDestinations(
        selectedDestinations.filter((d) => d._id !== destination._id)
      );
    } else {
      setSelectedDestinations([...selectedDestinations, destination]);
    }
  };

  const filteredDestinations = selectedTheme
    ? destinations.filter((d) => d.category === selectedTheme)
    : destinations;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateCounter = (field, delta) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(1, prev[field] + delta),
    }));

    if (field === 'travelers') {
      setTravelers(Math.max(1, formData.travelers + delta));
    }
  };

  const validateForm = () => {
    if (!formData.destination) {
      setError('Please enter destination');
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please select travel dates');
      return false;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date');
      return false;
    }

    if (selectedDestinations.length === 0) {
      setError('Please select at least one destination');
      return false;
    }

    setError('');
    return true;
  };

  const calculatePrice = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(
        'http://localhost:5000/api/destinations/price-calculation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            destinationIds: selectedDestinations.map((d) => d._id),

            days: selectedDestinations.map(() => formData.nights),

            startDate: formData.startDate,
          }),
        }
      );

      const data = await response.json();

      setPriceRange(data.data);
    } catch (err) {
      setError('Failed to calculate price');
    }
  };

  const handleAddToTrip = () => {
    selectedDestinations.forEach((dest) => {
      addDestination({
        name: dest.name,
        days: formData.nights,
        minPrice: dest.minPrice,
        maxPrice: dest.maxPrice,
        avgPrice: dest.avgPrice,
        description: dest.description,
      });
    });

    updateCart({
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfTravelers: formData.travelers,
    });

    navigate('/custom-trip');
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-surface-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-surface-900 mb-4 tracking-tight">
            Plan Your Dream Journey
          </h1>

          <p className="text-xl text-surface-500 max-w-2xl mx-auto">
            Create personalized travel experiences with destinations,
            budgets, dates and custom itineraries.
          </p>
        </div>

        {/* Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

          {[
            {
              title: 'I know my destination',
              description:
                'Build single city or multi-city trips with flights, hotels, activities and transfers.',
              icon: '✈️',
            },

            {
              title: 'I have a shortlist',
              description:
                'Compare destinations and discover the best value for your travel budget.',
              icon: '📍',
            },

            {
              title: 'Inspire Me',
              description:
                'Explore curated destinations and trending experiences around the world.',
              icon: '🧭',
            },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover border border-surface-200/50 transition-all duration-300 hover:-translate-y-2"
            >

              <div className="flex gap-5">

                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">
                  {card.icon}
                </div>

                <div>
                  <h3 className="font-bold text-primary-600 text-xl mb-3">
                    {card.title}
                  </h3>

                  <p className="text-surface-500 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Planner Form */}
        <div className="bg-white rounded-3xl shadow-card p-8 border border-surface-200/40 mb-16">

          <h2 className="font-display font-bold text-3xl text-surface-900 mb-10">
            Trip Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Start Location */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Start Location
              </label>

              <input
                type="text"
                name="startLocation"
                value={formData.startLocation}
                disabled
                className="w-full px-4 py-4 rounded-2xl border border-surface-300 bg-surface-100 text-surface-700"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Destination
              </label>

              <input
                type="text"
                name="destination"
                placeholder="Enter destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-2xl border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Number of Travellers
              </label>

              <div className="flex items-center justify-between border border-surface-300 rounded-2xl px-4 py-4">

                <button
                  type="button"
                  onClick={() => updateCounter('travelers', -1)}
                  className="text-primary-600 text-2xl font-bold"
                >
                  −
                </button>

                <span className="font-bold text-lg">
                  {formData.travelers} Travellers
                </span>

                <button
                  type="button"
                  onClick={() => updateCounter('travelers', 1)}
                  className="text-primary-600 text-2xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nights */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Number of Nights
              </label>

              <div className="flex items-center justify-between border border-surface-300 rounded-2xl px-4 py-4">

                <button
                  type="button"
                  onClick={() => updateCounter('nights', -1)}
                  className="text-primary-600 text-2xl font-bold"
                >
                  −
                </button>

                <span className="font-bold text-lg">
                  {formData.nights} Nights
                </span>

                <button
                  type="button"
                  onClick={() => updateCounter('nights', 1)}
                  className="text-primary-600 text-2xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-2xl border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-2xl border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-10">

            <button
              onClick={() =>
                setFormData({
                  startLocation: 'Delhi, India',
                  destination: '',
                  travelers: 2,
                  nights: 5,
                  startDate: '',
                  endDate: '',
                })
              }
              className="px-8 py-4 rounded-full border border-surface-300 text-surface-700 hover:bg-surface-100 transition-all duration-300"
            >
              Cancel
            </button>

            <button
              onClick={calculatePrice}
              className="px-10 py-4 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg"
            >
              Calculate Budget
            </button>
          </div>
        </div>

        {/* Trip Types */}
        <div className="mb-16">

          <h2 className="font-display font-bold text-3xl text-surface-900 mb-8">
            Select Trip Style
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            {TRIP_TYPES.map((type) => {
              const isSelected = selectedTheme === type;

              return (
                <button
                  key={type}
                  onClick={() => handleThemeSelect(type)}
                  className={`rounded-2xl py-6 px-6 font-bold transition-all duration-300 ${isSelected
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-white border border-surface-200 hover:border-primary-400 hover:shadow-card'
                    }`}
                >

                  <div className="text-2xl sm:text-3xl md:text-4xl mb-3">
                    {type === 'Honeymoon' && '💑'}
                    {type === 'Family' && '👨‍👩‍👧‍👦'}
                    {type === 'Adventure' && '🏔️'}
                    {type === 'Cultural' && '🏛️'}
                    {type === 'Beach' && '🏖️'}
                    {type === 'Budget' && '💰'}
                    {type === 'Luxury' && '✨'}
                    {type === 'Solo' && '🧑'}
                  </div>

                  <div>{type}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Destinations */}
        {selectedTheme && (
          <div>

            <h2 className="font-display font-bold text-3xl text-surface-900 mb-8">
              Choose Destinations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {filteredDestinations.map((dest) => {
                const isSelected = selectedDestinations.find(
                  (d) => d._id === dest._id
                );

                return (
                  <button
                    key={dest._id}
                    onClick={() => toggleDestination(dest)}
                    className={`bg-white rounded-3xl overflow-hidden shadow-card transition-all duration-300 border text-left ${isSelected
                        ? 'ring-4 ring-primary-500 scale-[1.02]'
                        : 'border-surface-200/50 hover:shadow-card-hover'
                      }`}
                  >

                    <div className="relative h-52 overflow-hidden">

                      <img
                        src={
                          dest.image ||
                          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />

                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-primary-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="p-6">

                      <h3 className="font-display font-bold text-xl text-surface-900 mb-2">
                        {dest.name}
                      </h3>

                      <p className="text-surface-500 text-sm mb-4">
                        📍 {dest.country}
                      </p>

                      <div className="flex justify-between items-center">

                        <span className="bg-surface-100 px-3 py-1 rounded-full text-xs font-bold text-surface-600">
                          ⭐ {dest.rating.toFixed(1)}
                        </span>

                        <span className="font-bold text-primary-600">
                          ${dest.minPrice} - ${dest.maxPrice}/day
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Estimate */}
        {priceRange.minPrice > 0 && (
          <div className="mt-16 bg-white rounded-3xl shadow-card p-10 border border-surface-200/50">

            <h2 className="font-display font-bold text-3xl text-surface-900 mb-8">
              Estimated Budget
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <p className="text-surface-500 font-semibold mb-2">
                  Minimum Cost
                </p>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-primary-600">
                  ${priceRange.minPrice}
                </h3>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 text-center">
                <p className="text-surface-500 font-semibold mb-2">
                  Average Cost
                </p>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-emerald-600">
                  ${priceRange.avgPrice}
                </h3>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 text-center">
                <p className="text-surface-500 font-semibold mb-2">
                  Maximum Cost
                </p>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-amber-500">
                  ${priceRange.maxPrice}
                </h3>
              </div>
            </div>

            <button
              onClick={handleAddToTrip}
              className="w-full mt-10 bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg"
            >
              Continue To Customize Itinerary →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}