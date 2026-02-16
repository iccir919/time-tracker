import React from 'react';

const ChartTypeToggle = ({ chartStyle, chartType, onStyleChange, onTypeChange }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Style toggle: Stacked vs Individual */}
      <div className="w-full flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => onStyleChange('stacked')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            chartStyle === 'stacked'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Stacked
        </button>
        <button
          onClick={() => onStyleChange('individual')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            chartStyle === 'individual'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Individual
        </button>
      </div>

      {/* Type toggle: Line vs Bar */}
      <div className="w-full flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => onTypeChange('line')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            chartType === 'line'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📉 Line
        </button>
        <button
          onClick={() => onTypeChange('bar')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            chartType === 'bar'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Bar
        </button>
      </div>
    </div>
  );
};

export default ChartTypeToggle;
