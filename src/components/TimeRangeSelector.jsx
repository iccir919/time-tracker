import React from 'react';

const TimeRangeSelector = ({ timeRange, onChange }) => {
  const ranges = ['week', 'month', 'year'];

  return (
    <div className="flex gap-2 mb-6">
      {ranges.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            timeRange === range
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Past {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
