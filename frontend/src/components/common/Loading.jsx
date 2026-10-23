import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="text-center relative">
        {/* Glow behind the loading spinner */}
        <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-xl animate-pulse-soft"></div>
        
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ✈️
          </div>
        </div>
        
        <h3 className="mt-6 text-surface-900 font-display font-semibold text-lg animate-pulse-soft">
          Preparing your journey...
        </h3>
        <p className="text-surface-400 text-xs mt-1">Discovering global wonders</p>
      </div>
    </div>
  );
}
