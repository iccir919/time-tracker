import React from 'react';

const ComparisonStats = ({ currentStats, comparisonStats, comparisonLabel, comparisonMode, timeRange, customDateRange }) => {
  // Always show the component if we have current stats
  if (!currentStats) {
    return null;
  }

  // Get the exact date range for comparison periods
  const getComparisonDateRangeText = () => {
    const now = new Date();
    let startDate, endDate;
    
    // Handle custom ranges
    if (timeRange === 'custom' && customDateRange) {
      const customStart = new Date(customDateRange.timeMin);
      const customEnd = new Date(customDateRange.timeMax);
      const durationMs = customEnd - customStart;
      
      if (comparisonMode === 'previous') {
        endDate = new Date(customStart);
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);
        startDate = new Date(endDate);
        startDate.setMilliseconds(startDate.getMilliseconds() - durationMs);
      } else if (comparisonMode === 'year-ago') {
        startDate = new Date(customStart);
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date(customEnd);
        endDate.setFullYear(endDate.getFullYear() - 1);
      }
    } else if (timeRange === 'week') {
      if (comparisonMode === 'previous') {
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 7);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
      } else if (comparisonMode === 'year-ago') {
        endDate = new Date(now);
        endDate.setFullYear(now.getFullYear() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
      }
    } else if (timeRange === 'month') {
      if (comparisonMode === 'previous') {
        endDate = new Date(now);
        endDate.setMonth(now.getMonth() - 1);
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (comparisonMode === 'year-ago') {
        endDate = new Date(now);
        endDate.setFullYear(now.getFullYear() - 1);
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
      }
    } else if (timeRange === 'year') {
      if (comparisonMode === 'previous') {
        endDate = new Date(now);
        endDate.setFullYear(now.getFullYear() - 1);
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
      }
    }
    
    if (!startDate || !endDate) return null;
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Create comparison data only if we have comparisonStats
  let eventComparisons = [];
  
  if (comparisonStats) {
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
    // Round to 2 decimals and remove trailing zeros
    const roundedChange = parseFloat(Math.abs(change).toFixed(2));

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold text-gray-900">Change from Previous Period</h2>
      </div>

      {/* Show exact date range for comparison period */}
      {getComparisonDateRangeText() && (
        <div className="mb-4 text-center">
          <p className="text-xs text-gray-600">
            Comparing to: <span className="font-medium">{getComparisonDateRangeText()}</span>
          </p>
        </div>
      )}

      {/* Only show comparison data if we have data */}
      {eventComparisons.length > 0 && (
        <>
          <div className="space-y-2 mt-4">
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
                        ? `was ${parseFloat(item.previousHours.toFixed(2))}h ${comparisonLabel}`
                        : `didn't exist ${comparisonLabel}`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {renderChange(item)}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {parseFloat(item.currentHours.toFixed(2))}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats at bottom */}
          {comparisonStats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
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
          )}
        </>
      )}

      {/* Show helpful message when comparison is loading */}
      {!comparisonStats && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Loading comparison data...</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonStats;