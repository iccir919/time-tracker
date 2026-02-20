// Generate time series data with separate lines for each event type (top 5 + Other)
export const generateMultiLineData = (eventList, timeRange, dateMin = null, dateMax = null) => {
  const dataByDateAndType = {};
  const eventTypeTotals = {};
  
  // First pass: calculate totals for each event type to find top 5
  eventList.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationHours = (end - start) / (1000 * 60 * 60);
      const eventType = event.summary || 'Untitled';
      
      eventTypeTotals[eventType] = (eventTypeTotals[eventType] || 0) + durationHours;
    }
  });
  
  // Get top 10 event types by total hours
  const topEventTypes = Object.entries(eventTypeTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);
  
  // Second pass: aggregate data by date
  eventList.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationHours = (end - start) / (1000 * 60 * 60);
      const eventType = event.summary || 'Untitled';
      
      // Determine if this is a top event type or goes into "Other"
      const categoryName = topEventTypes.includes(eventType) ? eventType : 'Other';
      
      let dateKey;
      
      // Group by appropriate time unit based on range
      switch(timeRange) {
        case 'week':
        case 'month':
        case 'custom':
          dateKey = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          break;
        case 'year':
          dateKey = start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          break;
        default:
          dateKey = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      
      if (!dataByDateAndType[dateKey]) {
        dataByDateAndType[dateKey] = {
          date: dateKey,
          timestamp: start.getTime(),
        };
      }
      
      // Add hours for this category
      dataByDateAndType[dateKey][categoryName] = 
        (dataByDateAndType[dateKey][categoryName] || 0) + durationHours;
    }
  });
  
  // Fill in missing days/months for continuous timeline
  const fillMissingDates = (data, range, minDate = null, maxDate = null) => {
    if (Object.keys(data).length === 0 && !minDate && !maxDate) return data;
    
    let minTimestamp, maxTimestamp;
    
    // Use provided date range if available, otherwise use data min/max
    if (minDate && maxDate) {
      minTimestamp = new Date(minDate).getTime();
      maxTimestamp = new Date(maxDate).getTime();
    } else {
      // Get min and max timestamps from existing data
      const timestamps = Object.values(data).map(d => d.timestamp);
      minTimestamp = Math.min(...timestamps);
      maxTimestamp = Math.max(...timestamps);
    }
    
    const filledData = { ...data };
    const currentDate = new Date(minTimestamp);
    const endDate = new Date(maxTimestamp);
    
    // Determine increment based on range
    const increment = (range === 'year') ? 'month' : 'day';
    
    while (currentDate <= endDate) {
      let dateKey;
      
      if (range === 'year') {
        dateKey = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else {
        dateKey = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      
      if (!filledData[dateKey]) {
        filledData[dateKey] = {
          date: dateKey,
          timestamp: currentDate.getTime(),
        };
      }
      
      // Increment date
      if (increment === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return filledData;
  };
  
  // Fill in missing dates using actual date range
  const completeData = fillMissingDates(dataByDateAndType, timeRange, dateMin, dateMax);
  
  // Create final event types list (top 5 + Other if it exists)
  const finalEventTypes = [...topEventTypes];
  const hasOther = Object.values(dataByDateAndType).some(point => point['Other'] > 0);
  if (hasOther) {
    finalEventTypes.push('Other');
  }
  
  // Convert to array and sort by timestamp
  const sortedData = Object.values(completeData)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(point => {
      const result = { date: point.date };
      // Keep full precision, don't round here
      finalEventTypes.forEach(type => {
        result[type] = point[type] || 0;
      });
      return result;
    });
  
  return {
    data: sortedData,
    eventTypes: finalEventTypes
  };
};

// Generate colors for each event type
const COLORS = [
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC04', // Google Yellow
  '#34A853', // Google Green
  '#FF6D01', // Orange
  '#46BDC6', // Teal
  '#7BAAF7', // Light Blue
  '#F07B72', // Coral
  '#FDD663', // Light Yellow
  '#81C995', // Light Green
  '#9AA0A6', // Gray (for "Other")
];

export const getColorForEventType = (eventType, index) => {
  // Use gray color for "Other"
  if (eventType === 'Other') {
    return '#9AA0A6';
  }
  return COLORS[index % COLORS.length];
};