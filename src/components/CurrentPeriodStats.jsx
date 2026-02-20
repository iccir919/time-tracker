import React from 'react';

const CurrentPeriodStats = ({ stats, timeRange }) => {
  if (!stats) {
    return null;
  }

  const getPeriodLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'custom':
        return 'Selected Period';
      default:
        return 'Current Period';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{getPeriodLabel()}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900">
            {parseFloat(stats.totalHours.toFixed(2))}
          </p>
        </div>
        <div className="text-center border-l border-r border-gray-300">
          <p className="text-sm text-gray-600 mb-1">Avg/Day</p>
          <p className="text-3xl font-bold text-gray-900">
            {parseFloat(stats.avgHoursPerDay.toFixed(2))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Events</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.eventCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentPeriodStats;