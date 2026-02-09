import React from 'react';

const ComparisonStats = ({ currentStats, comparisonStats, comparisonLabel, comparisonMode, onComparisonChange, timeRange }) => {
  // Always show the component if we have current stats
  if (!currentStats) {
    return null;
  }

  // Get available comparison options based on current time range
  const getComparisonOptions = () => {
    switch (timeRange) {
      case 'week':
        return [
          { value: 'none', label: 'None', icon: '—' },
          { value: 'previous', label: 'Last Week', icon: '←' },
          { value: 'year-ago', label: 'Year Ago', icon: '📅' }
        ];
      case 'month':
        return [
          { value: 'none', label: 'None', icon: '—' },
          { value: 'previous', label: 'Last Month', icon: '←' },
          { value: 'year-ago', label: 'Year Ago', icon: '📅' }
        ];
      case 'year':
        return [
          { value: 'none', label: 'None', icon: '—' },
          { value: 'previous', label: 'Last Year', icon: '←' }
        ];
      case 'custom':
        // Don't show comparison options for custom ranges
        return null;
      default:
        return [{ value: 'none', label: 'None', icon: '—' }];
    }
  };

  const options = getComparisonOptions();

  // Don't show comparison section for custom date ranges
  if (!options) {
    return null;
  }

  // Create comparison data only if we have comparisonStats
  let eventComparisons = [];
  
  if (comparisonStats && comparisonMode !== 'none') {
    // Create a map of comparison event hours for easy lookup
    const comparisonEventMap = {};
    comparisonStats.eventsByType.forEach(event => {
      comparisonEventMap[event.name] = event.hours;
    });

    // Create a map of current event hours
    const currentEventMap = {};
    currentStats.eventsByType.forEach(event => {
      currentEventMap[event.name] = event.hours;
    });

    // Get all unique event types from both periods
    const allEventTypes = new Set([
      ...currentStats.eventsByType.map(e => e.name),
      ...comparisonStats.eventsByType.map(e => e.name)
    ]);

    // Build comparison data for each event type
    eventComparisons = Array.from(allEventTypes).map(eventName => {
      const currentHours = currentEventMap[eventName] || 0;
      const previousHours = comparisonEventMap[eventName] || 0;
      
      let change = null;
      let changePercent = null;
      
      if (previousHours > 0) {
        change = currentHours - previousHours;
        changePercent = Math.round((change / previousHours) * 100);
      } else if (currentHours > 0) {
        // New event type that didn't exist before
        changePercent = 'new';
      }

      return {
        name: eventName,
        currentHours,
        previousHours,
        change,
        changePercent
      };
    }).filter(item => item.currentHours > 0 || item.previousHours > 0)
      .sort((a, b) => b.currentHours - a.currentHours);
  }

  const renderChange = (item) => {
    const { currentHours, previousHours, change, changePercent } = item;

    if (changePercent === 'new') {
      return (
        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <span>✨</span>
          <span>New</span>
        </div>
      );
    }

    if (previousHours === 0) {
      return null;
    }

    if (change === 0) {
      return (
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-500">
          <span>→</span>
          <span>No change</span>
        </div>
      );
    }

    const isIncrease = change > 0;
    const roundedChange = Math.round(Math.abs(change) * 10) / 10;

    return (
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        isIncrease ? 'text-green-600' : 'text-red-600'
      }`}>
        <span>{isIncrease ? '↑' : '↓'}</span>
        <span>{roundedChange}h</span>
        <span className="text-xs">({changePercent > 0 ? '+' : ''}{changePercent}%)</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mt-8">
      {/* Comparison selector buttons at top - ALWAYS SHOWN */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Compare To
        </label>
        <div className="flex gap-2">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => onComparisonChange(option.value)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                comparisonMode === option.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1.5">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Only show comparison data if not "none" and we have data */}
      {comparisonMode !== 'none' && comparisonStats && eventComparisons.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-bold text-gray-900">Event Comparison</h3>
          </div>
          
          <div className="space-y-2">
            {eventComparisons.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.previousHours > 0 
                        ? `was ${Math.round(item.previousHours * 10) / 10}h ${comparisonLabel}`
                        : `didn't exist ${comparisonLabel}`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {renderChange(item)}
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {Math.round(item.currentHours * 10) / 10}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats at bottom */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Total Now</p>
                <p className="text-lg font-bold text-gray-900">{currentStats.totalHours}h</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total {comparisonLabel}</p>
                <p className="text-lg font-bold text-gray-900">{comparisonStats.totalHours}h</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Show helpful message when comparison is selected but data is loading/unavailable */}
      {comparisonMode !== 'none' && !comparisonStats && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Loading comparison data...</p>
        </div>
      )}

      {/* Show helpful message when "None" is selected */}
      {comparisonMode === 'none' && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Select a comparison period above to see how your time has changed</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonStats;
