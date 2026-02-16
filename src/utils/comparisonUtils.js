// Get comparison date range based on current range and comparison mode
export const getComparisonDateRange = (timeRange, comparisonMode, customDateRange = null) => {
  const now = new Date();
  
  if (comparisonMode === 'none' || !comparisonMode) {
    return null;
  }

  let timeMin, timeMax;

  // Handle custom date ranges
  if (timeRange === 'custom' && customDateRange) {
    const customStart = new Date(customDateRange.timeMin);
    const customEnd = new Date(customDateRange.timeMax);
    const durationMs = customEnd - customStart;
    
    if (comparisonMode === 'previous') {
      // Previous period (same length as custom range)
      timeMax = new Date(customStart);
      timeMax.setMilliseconds(timeMax.getMilliseconds() - 1); // End just before custom start
      timeMin = new Date(timeMax);
      timeMin.setMilliseconds(timeMin.getMilliseconds() - durationMs); // Go back by duration
    } else if (comparisonMode === 'year-ago') {
      // Same period last year
      timeMin = new Date(customStart);
      timeMin.setFullYear(timeMin.getFullYear() - 1);
      timeMax = new Date(customEnd);
      timeMax.setFullYear(timeMax.getFullYear() - 1);
    }
  } else if (timeRange === 'week') {
    if (comparisonMode === 'previous') {
      // Previous week
      timeMin = new Date();
      timeMin.setDate(now.getDate() - 14);
      timeMax = new Date();
      timeMax.setDate(now.getDate() - 7);
    } else if (comparisonMode === 'year-ago') {
      // Same week last year
      timeMin = new Date();
      timeMin.setFullYear(now.getFullYear() - 1);
      timeMin.setDate(now.getDate() - 7);
      timeMax = new Date();
      timeMax.setFullYear(now.getFullYear() - 1);
    }
  } else if (timeRange === 'month') {
    if (comparisonMode === 'previous') {
      // Previous month
      timeMin = new Date();
      timeMin.setMonth(now.getMonth() - 2);
      timeMax = new Date();
      timeMax.setMonth(now.getMonth() - 1);
    } else if (comparisonMode === 'year-ago') {
      // Same month last year
      timeMin = new Date();
      timeMin.setFullYear(now.getFullYear() - 1);
      timeMin.setMonth(now.getMonth() - 1);
      timeMax = new Date();
      timeMax.setFullYear(now.getFullYear() - 1);
    }
  } else if (timeRange === 'year') {
    if (comparisonMode === 'previous') {
      // Previous year
      timeMin = new Date();
      timeMin.setFullYear(now.getFullYear() - 2);
      timeMax = new Date();
      timeMax.setFullYear(now.getFullYear() - 1);
    }
  }

  if (!timeMin || !timeMax) {
    return null;
  }

  return {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString()
  };
};

export const getComparisonLabel = (timeRange, comparisonMode) => {
  if (comparisonMode === 'none' || !comparisonMode) {
    return null;
  }

  if (timeRange === 'custom') {
    return comparisonMode === 'previous' ? 'previous period' : 'same period last year';
  } else if (timeRange === 'week') {
    return comparisonMode === 'previous' ? 'last week' : 'same week last year';
  } else if (timeRange === 'month') {
    return comparisonMode === 'previous' ? 'last month' : 'same month last year';
  } else if (timeRange === 'year') {
    return 'last year';
  }

  return null;
};

// Filter events by selected event type
export const filterEventsByType = (events, selectedEventType) => {
  if (!selectedEventType) {
    return events;
  }

  return events.filter(event => {
    const eventType = event.summary || 'Untitled';
    return eventType === selectedEventType;
  });
};