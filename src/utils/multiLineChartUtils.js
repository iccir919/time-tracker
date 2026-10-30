// 0 -> "12 AM", 9 -> "9 AM", 12 -> "12 PM", 15 -> "3 PM"
const formatHourLabel = (hour) => {
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${hour < 12 ? 'AM' : 'PM'}`;
};

// Generate time series data with separate lines for each event type (top 10 + Other)
export const generateMultiLineData = (eventList, timeRange, dateMin = null, dateMax = null, groupBy = 'days', selectedWeekday = null, disabledEvents = new Set()) => {
  // Filter events: exclude disabled event types
  let filteredEvents = eventList.filter(event => {
    if (disabledEvents.has(event.summary)) {
      return false;
    }
    return true;
  });

  // If weekday mode, further filter events to only that weekday
  if (groupBy === 'weekday' && selectedWeekday !== null && selectedWeekday !== undefined) {
    filteredEvents = filteredEvents.filter(event => {
      if (event.start.dateTime) {
        const start = new Date(event.start.dateTime);
        const eventDay = start.getDay();
        return eventDay === selectedWeekday;
      }
      return false;
    });
  }

  const dataByDateAndType = {};
  const eventTypeTotals = {};
  
  // First pass: calculate totals for each event type to find top 10
  filteredEvents.forEach(event => {
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
  
  // Time of day mode: start with all 24 hours so empty hours still show
  if (groupBy === 'hour') {
    for (let h = 0; h < 24; h++) {
      const label = formatHourLabel(h);
      dataByDateAndType[label] = { date: label, timestamp: h };
    }
  }

  // Second pass: aggregate data by date using groupBy parameter
  filteredEvents.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationHours = (end - start) / (1000 * 60 * 60);
      const eventType = event.summary || 'Untitled';

      // Determine if this is a top event type or goes into "Other"
      const categoryName = topEventTypes.includes(eventType) ? eventType : 'Other';

      // Time of day mode: spread the event across every hour it covers.
      // A 9:30 to 11:30 event adds 0.5h to 9 AM, 1h to 10 AM, 0.5h to 11 AM.
      if (groupBy === 'hour') {
        let cursor = new Date(start);
        while (cursor < end) {
          const nextHour = new Date(cursor);
          nextHour.setMinutes(0, 0, 0);
          nextHour.setHours(nextHour.getHours() + 1);
          const segmentEnd = nextHour < end ? nextHour : end;
          const hoursInSlot = (segmentEnd - cursor) / (1000 * 60 * 60);
          const bucket = dataByDateAndType[formatHourLabel(cursor.getHours())];
          bucket[categoryName] = (bucket[categoryName] || 0) + hoursInSlot;
          cursor = segmentEnd;
        }
        return;
      }

      let dateKey;
      
      // Group by the specified grouping level
      if (groupBy === 'weekday') {
        // For weekday mode, show each individual occurrence with its full date
        dateKey = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (groupBy === 'months') {
        // Group by month
        dateKey = start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else if (groupBy === 'weeks') {
        // Group by week (start of week)
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - start.getDay()); // Go to Sunday
        dateKey = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        // Group by day (default)
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
  
  // Fill in missing days/weeks/months for continuous timeline
  const fillMissingDates = (data, groupByParam, minDate = null, maxDate = null, weekdayToFill = null) => {
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
    
    // For weekday mode, fill in all instances of that weekday
    if (groupByParam === 'weekday' && weekdayToFill !== null && weekdayToFill !== undefined) {
      // Find first occurrence of the weekday
      while (currentDate <= endDate) {
        if (currentDate.getDay() === weekdayToFill) {
          const dateKey = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          if (!filledData[dateKey]) {
            filledData[dateKey] = {
              date: dateKey,
              timestamp: currentDate.getTime(),
            };
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return filledData;
    }
    
    // Determine increment based on groupBy
    let increment;
    if (groupByParam === 'months') {
      increment = 'month';
    } else if (groupByParam === 'weeks') {
      increment = 'week';
    } else {
      increment = 'day';
    }
    
    while (currentDate <= endDate) {
      let dateKey;
      
      if (groupByParam === 'months') {
        dateKey = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else if (groupByParam === 'weeks') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        dateKey = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
      } else if (increment === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return filledData;
  };
  
  // Fill in missing dates using actual date range and groupBy
  // (Time of day mode already has all 24 hours, so there is nothing to fill)
  const completeData = groupBy === 'hour'
    ? dataByDateAndType
    : fillMissingDates(dataByDateAndType, groupBy, dateMin, dateMax, selectedWeekday);
  
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
        const value = point[type] || 0;
        // Spread hours produce long decimals, so round them to 2 places
        result[type] = groupBy === 'hour' ? Math.round(value * 100) / 100 : value;
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