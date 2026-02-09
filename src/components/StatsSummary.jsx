import React from 'react';
import StatsCard from './StatsCard';

const StatsSummary = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatsCard
        emoji="⏱️"
        label="Total Hours"
        value={stats.totalHours}
        subtitle="hours tracked"
        gradient="from-blue-500 to-blue-600"
      />
      <StatsCard
        emoji="📈"
        label="Daily Average"
        value={stats.avgHoursPerDay}
        subtitle="hours per day"
        gradient="from-purple-500 to-purple-600"
      />
      <StatsCard
        emoji="📅"
        label="Events"
        value={stats.eventCount}
        subtitle="total events"
        gradient="from-indigo-500 to-indigo-600"
      />
    </div>
  );
};

export default StatsSummary;
