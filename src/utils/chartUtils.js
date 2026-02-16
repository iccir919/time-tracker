// Time series data generation for graphs
export const generateTimeSeriesData = (eventList, timeRange) => {
  const dataPoints = {};
  
  eventList.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationHours = (end - start) / (1000 * 60 * 60);
      
      let dateKey;
      
      // Group by appropriate time unit based on range
      switch(timeRange) {
        case 'week':
          // Group by day for week view
          dateKey = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'month':
          // Group by day for month view
          dateKey = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'year':
          // Group by month for year view
          dateKey = start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          break;
        default:
          dateKey = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!dataPoints[dateKey]) {
        dataPoints[dateKey] = {
          date: dateKey,
          hours: 0,
          timestamp: start.getTime()
        };
      }
      
      dataPoints[dateKey].hours += durationHours;
    }
  });
  
  // Convert to array and sort by timestamp
  const sortedData = Object.values(dataPoints)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(point => ({
      date: point.date,
      hours: point.hours  // Keep full precision
    }));
  
  return sortedData;
};

export const getGraphTitle = (timeRange, customLabel) => {
  if (timeRange === 'custom' && customLabel) {
    return `Hours: ${customLabel}`;
  }
  
  switch(timeRange) {
    case 'week':
      return 'Daily Hours - Past Week';
    case 'month':
      return 'Daily Hours - Past Month';
    case 'year':
      return 'Monthly Hours - Past Year';
    default:
      return 'Hours Over Time';
  }
};