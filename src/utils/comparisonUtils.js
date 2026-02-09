// Get comparison date range based on current range and comparison mode
export const getComparisonDateRange = (timeRange, comparisonMode) => {
  const now = new Date();
  
  if (comparisonMode === 'none' || !comparisonMode) {
    return null;
  }

  let timeMin, timeMax;

  if (timeRange === 'week') {
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

  if (timeRange === 'week') {
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
