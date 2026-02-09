import React from 'react';

const ChartTypeToggle = ({ chartStyle, chartType, onStyleChange, onTypeChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
      {/* Style toggle: Stacked vs Individual */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => onStyleChange('stacked')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            chartStyle === 'stacked'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Stacked
        </button>
        <button
          onClick={() => onStyleChange('individual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            chartStyle === 'individual'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Individual
        </button>
      </div>

      {/* Type toggle: Line vs Bar */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => onTypeChange('line')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            chartType === 'line'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📉 Line
        </button>
        <button
          onClick={() => onTypeChange('bar')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            chartType === 'bar'
              ? 'bg-white text-indigo-600 shadow-sm'
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
