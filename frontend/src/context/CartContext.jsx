import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage.js';

const CartContext = createContext();

const defaultCart = {
  customPackageId: null,
  destinations: [],
  numberOfTravelers: 1,
  startDate: '',
  endDate: '',
  totalDays: 0,
  totalPrice: 0,
  accommodationTotal: 0,
  transportTotal: 0,
  activitiesTotal: 0,
  budgetType: 'standard', // 'economy' | 'standard' | 'luxury'
  estimatedBudget: 0,
  budgetRange: { min: 0, max: 0 },
  specialRequests: '',
};

/**
 * Pricing engine — calculates all cost breakdowns from destination data.
 *
 * Each destination in cart has:
 *   name, nights, economyPerNight, standardPerNight, luxuryPerNight,
 *   transportCharge, activitiesCharge (from DB lookup)
 *   — OR —
 *   costPerDay (manual fallback for unknown destinations)
 */
const calculateTotals = (destinations, travelers, budgetType) => {
  const totalDays = destinations.reduce((sum, dest) => sum + (dest.nights || dest.days || 0), 0);

  let accommodationTotal = 0;
  let transportTotal = 0;
  let activitiesTotal = 0;

  destinations.forEach((dest) => {
    const nights = dest.nights || dest.days || 0;

    // Use pricing engine fields if available, else fall back to costPerDay
    const perNight = (() => {
      if (dest.economyPerNight !== undefined) {
        if (budgetType === 'economy') return dest.economyPerNight;
        if (budgetType === 'luxury') return dest.luxuryPerNight;
        return dest.standardPerNight;
      }
      // legacy / manual destination
      return dest.avgPrice || dest.costPerDay || dest.minPrice || 0;
    })();

    accommodationTotal += perNight * nights;
    transportTotal += dest.transportCharge || 0;
    activitiesTotal += dest.activitiesCharge || 0;
  });

  // Multiply accommodation by travelers; transport/activities are per-group
  const totalPrice =
    accommodationTotal * travelers + transportTotal + activitiesTotal;

  return {
    totalDays,
    totalPrice,
    accommodationTotal: accommodationTotal * travelers,
    transportTotal,
    activitiesTotal,
  };
};

export const CartProvider = ({ children }) => {
  const savedCart = getFromLocalStorage('cart');
  const [cart, setCart] = useState(savedCart || defaultCart);

  const updateCart = (updates) => {
    setCart((prev) => {
      const updated = { ...prev, ...updates };
      const totals = calculateTotals(
        updated.destinations,
        updated.numberOfTravelers,
        updated.budgetType
      );
      return { ...updated, ...totals };
    });
  };

  const addDestination = (destination) => {
    updateCart({ destinations: [...cart.destinations, destination] });
  };

  const removeDestination = (index) => {
    updateCart({ destinations: cart.destinations.filter((_, i) => i !== index) });
  };

  const updateDestination = (index, updatedDestination) => {
    const updatedDestinations = cart.destinations.map((dest, i) =>
      i === index ? updatedDestination : dest
    );
    updateCart({ destinations: updatedDestinations });
  };

  const setTravelers = (number) => {
    updateCart({ numberOfTravelers: number });
  };

  const setBudgetType = (type) => {
    updateCart({ budgetType: type });
  };

  const clearCart = () => {
    setCart(defaultCart);
  };

  useEffect(() => {
    saveToLocalStorage('cart', cart);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addDestination,
        removeDestination,
        updateDestination,
        setTravelers,
        setBudgetType,
        updateCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export default CartContext;