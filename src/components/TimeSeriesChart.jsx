import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const CustomTooltip = ({ active, payload, label, showComparison }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        
        {showComparison ? (
          // Show current vs comparison
          <>
            <div className="mb-2 pb-2 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Current Period</p>
              {payload
                .filter(entry => entry.dataKey.startsWith('current_'))
                .map((entry, index) => {
                  const eventName = entry.dataKey.replace('current_', '');
                  return (
                    <div key={index} className="flex items-center justify-between gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-sm text-gray-700">{eventName}:</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: entry.fill }}>
                        {entry.value || 0}h
                      </span>
                    </div>
                  );
                })}
            </div>
            
            <div>
              <p className="text-xs text-gray-600 mb-1">Comparison Period</p>
              {payload
                .filter(entry => entry.dataKey.startsWith('comparison_'))
                .map((entry, index) => {
                  const eventName = entry.dataKey.replace('comparison_', '');
                  return (
                    <div key={index} className="flex items-center justify-between gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: entry.fill, opacity: 0.5 }}
                        />
                        <span className="text-sm text-gray-700">{eventName}:</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-500">
                        {entry.value || 0}h
                      </span>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          // Show just current period
          <>
            {payload.map((entry, index) => {
              const total = payload.reduce((sum, e) => sum + (e.value || 0), 0);
              if (index === 0) {
                return (
                  <p key="total" className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                    Total: {Math.round(total * 10) / 10}h
                  </p>
                );
              }
              return null;
            })}
            {payload.reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">{entry.name}:</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: entry.color }}>
                  {entry.value}h
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }
  return null;
};

const TimeSeriesChart = ({ currentData, comparisonData, eventTypes, colors, title, showComparison }) => {
  if (!currentData || currentData.length === 0) {
    return null;
  }

  // Debug: Log the dates to see format
  if (showComparison && comparisonData && currentData.length > 0) {
    console.log('Current dates:', currentData.map(d => d.date));
    console.log('Comparison dates:', comparisonData.map(d => d.date));
  }

  // Merge current and comparison data for side-by-side bars
  // Match by date string OR by index as fallback
  const mergedData = currentData.map((currentPoint, index) => {
    const merged = { date: currentPoint.date };
    
    // Add current period data with 'current_' prefix
    eventTypes.forEach(eventType => {
      merged[`current_${eventType}`] = currentPoint[eventType] || 0;
    });
    
    // Add comparison period data with 'comparison_' prefix if showing comparison
    if (showComparison && comparisonData) {
      // Try to match by date first
      let matchingComparisonPoint = comparisonData.find(cp => cp.date === currentPoint.date);
      
      // Fallback to index matching if date doesn't match (different date ranges)
      if (!matchingComparisonPoint && comparisonData[index]) {
        matchingComparisonPoint = comparisonData[index];
        console.log(`No date match for ${currentPoint.date}, using index ${index}: ${matchingComparisonPoint.date}`);
      }
      
      if (matchingComparisonPoint) {
        eventTypes.forEach(eventType => {
          merged[`comparison_${eventType}`] = matchingComparisonPoint[eventType] || 0;
        });
      } else {
        // No matching date in comparison - set to 0
        eventTypes.forEach(eventType => {
          merged[`comparison_${eventType}`] = 0;
        });
      }
    }
    
    return merged;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={10}
            angle={currentData.length > 15 ? -45 : 0}
            textAnchor={currentData.length > 15 ? 'end' : 'middle'}
            height={currentData.length > 15 ? 80 : 30}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={10}
            label={{ 
              value: 'Hours', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip showComparison={showComparison} />} />
          
          {showComparison ? (
            // Side-by-side bars: current and comparison
            <>
              {/* Current period bars - stacked, full opacity */}
              {eventTypes && eventTypes.map((eventType, index) => (
                <Bar
                  key={`current_${eventType}`}
                  dataKey={`current_${eventType}`}
                  stackId="current"
                  fill={colors[index]}
                  name={eventType}
                />
              ))}
              
              {/* Comparison period bars - stacked, lighter opacity */}
              {eventTypes && eventTypes.map((eventType, index) => (
                <Bar
                  key={`comparison_${eventType}`}
                  dataKey={`comparison_${eventType}`}
                  stackId="comparison"
                  fill={colors[index]}
                  fillOpacity={0.5}
                  name={`${eventType} (comparison)`}
                />
              ))}
            </>
          ) : (
            // Just current period - stacked bars
            eventTypes && eventTypes.map((eventType, index) => (
              <Bar
                key={eventType}
                dataKey={`current_${eventType}`}
                stackId="1"
                fill={colors[index]}
                name={eventType}
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend explaining the bars */}
      {showComparison && (
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 rounded"></div>
            <span className="text-gray-700">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 opacity-50 rounded"></div>
            <span className="text-gray-700">Comparison Period</span>
          </div>
        </div>
      )}

      {/* Note about top 10 */}
      {eventTypes && eventTypes.includes('Other') && (
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Showing top 10 event types. Remaining events grouped as "Other"
        </p>
      )}
    </div>
  );
};

export default TimeSeriesChart;