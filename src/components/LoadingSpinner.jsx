import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p className="text-gray-600 mt-4">Loading your calendar data...</p>
    </div>
  );
};

export default LoadingSpinner;
