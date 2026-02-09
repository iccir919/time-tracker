import React from 'react';

const StatsCard = ({ emoji, label, value, subtitle, gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <p className="text-white/80 text-sm font-medium">{label}</p>
      </div>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-white/80 text-sm mt-1">{subtitle}</p>
    </div>
  );
};

export default StatsCard;
