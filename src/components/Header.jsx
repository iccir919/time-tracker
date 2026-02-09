import React from 'react';

const Header = ({ onSignOut }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="text-4xl">
          📊
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Time Tracker</h1>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-xl">🚪</span>
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
};

export default Header;
