import React from 'react';

const TimeRangeSelector = ({ timeRange, onChange, onCustomClick }) => {
  const ranges = ['week', 'month', 'year'];

  return (
    <div className="flex gap-2 mb-8">
      {ranges.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            timeRange === range
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Past {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
      <button
        onClick={onCustomClick}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
          timeRange === 'custom'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📅 Custom
      </button>
    </div>
  );
};

export default TimeRangeSelector;
