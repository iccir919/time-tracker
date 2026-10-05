import React from 'react';

const TimeRangeSelector = ({ timeRange, onChange, onCustomClick }) => {
  const ranges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last 60 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="flex gap-2 mb-6">
      {ranges.map(range => (
        <button
          key={range.value}
          onClick={() => {
            if (range.value === 'custom' && onCustomClick) {
              onCustomClick();
            } else {
              onChange(range.value);
            }
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            timeRange === range.value
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;