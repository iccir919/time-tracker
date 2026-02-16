import React from 'react';

const DateRangeDisplay = ({ timeRange, customDateRange, onCustomClick }) => {
  const getDateRangeText = () => {
    const now = new Date();
    
    if (timeRange === 'custom' && customDateRange) {
      // Already formatted in customDateRange.label
      return customDateRange.label;
    }
    
    let startDate, endDate;
    
    switch (timeRange) {
      case 'week':
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return '';
    }
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  const dateRangeText = getDateRangeText();
  
  if (!dateRangeText) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      {/* Date range display */}
      <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
        <span className="text-sm">📅</span>
        <span className="text-sm font-medium">{dateRangeText}</span>
      </div>
      
      {/* Custom date picker button */}
      <button
        onClick={onCustomClick}
        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
          timeRange === 'custom'
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📅 Custom Range
      </button>
    </div>
  );
};

export default DateRangeDisplay;
