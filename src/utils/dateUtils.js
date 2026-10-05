// Date range utilities
export const getDateRange = (range) => {
  const now = new Date();
  const timeMin = new Date();
  const timeMax = new Date();
  
  // Set timeMax to end of today (11:59:59.999 PM)
  timeMax.setHours(23, 59, 59, 999);
  
  switch(range) {
    case 'week':
      // Go back 7 days and set to start of that day (12:00:00 AM)
      timeMin.setDate(now.getDate() - 7);
      timeMin.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // Go back 30 days and set to start of that day (12:00:00 AM)
      timeMin.setDate(now.getDate() - 30);
      timeMin.setHours(0, 0, 0, 0);
      break;
    case 'year':
      // Go back 60 days and set to start of that day (12:00:00 AM)
      timeMin.setDate(now.getDate() - 60);
      timeMin.setHours(0, 0, 0, 0);
      break;
    default:
      timeMin.setDate(now.getDate() - 7);
      timeMin.setHours(0, 0, 0, 0);
  }
  
  // IMPORTANT: Both must be ISO strings
  return {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString()
  };
};

export const formatTimeRange = (range) => {
  switch(range) {
    case 'week':
      return 'Past Week';
    case 'month':
      return 'Past Month';
    case 'year':
      return 'Past Year';
    default:
      return 'Past Week';
  }
};