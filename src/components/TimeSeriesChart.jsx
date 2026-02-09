import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';

const CustomTooltip = ({ active, payload, label, isStacked }) => {
  if (active && payload && payload.length) {
    // Calculate total for stacked view
    const total = isStacked 
      ? payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
      : null;
    
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {isStacked && (
          <p className="text-sm font-bold text-indigo-600 mb-2 pb-2 border-b border-gray-200">
            Total: {Math.round(total * 10) / 10}h
          </p>
        )}
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
      </div>
    );
  }
  return null;
};

const TimeSeriesChart = ({ data, eventTypes, colors, title, chartStyle = 'stacked', chartType = 'line' }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const isStacked = chartStyle === 'stacked';
  const isBar = chartType === 'bar';

  // Choose the appropriate chart component
  const ChartComponent = isBar 
    ? BarChart 
    : (isStacked ? AreaChart : LineChart);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📈</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Gradients for stacked area charts */}
          {!isBar && isStacked && (
            <defs>
              {eventTypes && eventTypes.map((eventType, index) => (
                <linearGradient key={eventType} id={`color-${eventType.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index]} stopOpacity={0.3}/>
                </linearGradient>
              ))}
            </defs>
          )}
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={10}
            angle={data.length > 15 ? -45 : 0}
            textAnchor={data.length > 15 ? 'end' : 'middle'}
            height={data.length > 15 ? 80 : 30}
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
          <Tooltip content={<CustomTooltip isStacked={isStacked} />} />
          {eventTypes && eventTypes.length > 0 && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType={isBar ? 'square' : (isStacked ? 'square' : 'line')}
            />
          )}
          
          {/* Render based on chart type and style */}
          {isBar ? (
            // Bar charts
            eventTypes && eventTypes.map((eventType, index) => (
              <Bar
                key={eventType}
                dataKey={eventType}
                stackId={isStacked ? "1" : undefined}
                fill={colors[index]}
                name={eventType}
              />
            ))
          ) : isStacked ? (
            // Stacked area charts
            eventTypes && eventTypes.map((eventType, index) => (
              <Area
                key={eventType}
                type="monotone"
                dataKey={eventType}
                stackId="1"
                stroke={colors[index]}
                fill={`url(#color-${eventType.replace(/\s/g, '-')})`}
                strokeWidth={2}
                name={eventType}
              />
            ))
          ) : (
            // Individual line charts
            eventTypes && eventTypes.map((eventType, index) => (
              <Line
                key={eventType}
                type="monotone"
                dataKey={eventType}
                stroke={colors[index]}
                strokeWidth={2}
                dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: colors[index] }}
                name={eventType}
              />
            ))
          )}
        </ChartComponent>
      </ResponsiveContainer>

      {/* Note about top 5 */}
      {eventTypes && eventTypes.includes('Other') && (
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Showing top 5 event types. Remaining events grouped as "Other"
        </p>
      )}
    </div>
  );
};

export default TimeSeriesChart;
