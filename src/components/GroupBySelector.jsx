import React from 'react';

const GroupBySelector = ({ groupBy, onChange, timeRange }) => {
  // Determine which grouping options are available based on time range
  const getGroupingOptions = () => {
    if (timeRange === 'year') {
      return [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' }
      ];
    } else if (timeRange === 'custom') {
      // For custom, show all options - the actual availability will be smart based on range length
      return [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' }
      ];
    }
    return [];
  };

  const options = getGroupingOptions();

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Group By
      </label>
      <div className="flex gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              groupBy === option.value
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupBySelector;