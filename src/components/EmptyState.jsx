import React from 'react';

const EmptyState = ({ timeRange, customDateRange }) => {
  const getRangeText = () => {
    if (timeRange === 'custom' && customDateRange) {
      return customDateRange.label;
    }
    return `the past ${timeRange}`;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No events found
        </h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any calendar events for {getRangeText()}.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Try:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Selecting a different time range</li>
            <li>• Choosing another calendar</li>
            <li>• Checking if events exist in Google Calendar</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
