import React from 'react';

const ComparisonSelector = ({ comparisonMode, onChange, timeRange, showOnGraph, onShowOnGraphChange }) => {
  const getComparisonOptions = () => {
    const baseOptions = [
      { value: 'none', label: 'None' },
      { value: 'previous', label: getPreviousLabel() },
      { value: 'year-ago', label: 'Year Ago' }
    ];
    
    return baseOptions;
  };
  
  const getPreviousLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Last Week';
      case 'month':
        return 'Last Month';
      case 'year':
        return 'Last Year';
      case 'custom':
        return 'Previous Period';
      default:
        return 'Previous Period';
    }
  };

  // Calculate comparison date range for display
  const getComparisonDateRangeText = () => {
    const now = new Date();
    let startDate, endDate;
    
    if (comparisonMode === 'none') return null;
    
    if (comparisonMode === 'previous') {
      if (timeRange === 'week') {
        startDate = new Date();
        startDate.setDate(now.getDate() - 14);
        endDate = new Date();
        endDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 2);
        endDate = new Date();
        endDate.setMonth(now.getMonth() - 1);
      } else if (timeRange === 'year') {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 2);
        endDate = new Date();
        endDate.setFullYear(now.getFullYear() - 1);
      }
    } else if (comparisonMode === 'year-ago') {
      if (timeRange === 'week') {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date();
        endDate.setFullYear(now.getFullYear() - 1);
      } else if (timeRange === 'month') {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setMonth(now.getMonth() - 1);
        endDate = new Date();
        endDate.setFullYear(now.getFullYear() - 1);
      }
    }
    
    if (!startDate || !endDate) return null;
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const options = getComparisonOptions();
  const dateRangeText = getComparisonDateRangeText();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Comparison Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compare To Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compare To
          </label>
          <div className="relative">
            <select
              value={comparisonMode}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Show comparison date range */}
          {dateRangeText && (
            <p className="mt-2 text-xs text-gray-600">
              📅 {dateRangeText}
            </p>
          )}
        </div>

        {/* Show on Graph Checkbox */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Options
          </label>
          <label className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              checked={showOnGraph}
              onChange={(e) => onShowOnGraphChange(e.target.checked)}
              disabled={comparisonMode === 'none'}
              className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:opacity-50"
            />
            <span className={`font-medium ${comparisonMode === 'none' ? 'text-gray-400' : 'text-gray-900'}`}>
              Show on Graph
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSelector;