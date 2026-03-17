import React from 'react';

const GroupBySelector = ({ groupBy, onChange, timeRange }) => {
  // Determine which grouping options are available based on time range
  const getGroupingOptions = () => {
    switch (timeRange) {
      case 'week':
        // Week: Just Day (too short for week grouping)
        return [
          { value: 'days', label: 'Day' }
        ];
      
      case 'month':
        // Month: Day or Week
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' }
        ];
      
      case 'year':
        // Year: Day, Week, or Month
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' },
          { value: 'months', label: 'Month' }
        ];
      
      case 'custom':
        // Custom: All options
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' },
          { value: 'months', label: 'Month' }
        ];
      
      default:
        return null;
    }
  };

  const options = getGroupingOptions();

  // Don't show if no options or only one option
  if (!options || options.length <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-3 mt-4 mb-6">
      <span className="text-sm font-medium text-gray-700">View by:</span>
      <div className="flex gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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