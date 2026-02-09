// Date range utilities
export const getDateRange = (range) => {
  const now = new Date();
  const timeMin = new Date();
  
  switch(range) {
    case 'week':
      timeMin.setDate(now.getDate() - 7);
      break;
    case 'month':
      timeMin.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      timeMin.setFullYear(now.getFullYear() - 1);
      break;
    default:
      timeMin.setDate(now.getDate() - 7);
  }
  
  // IMPORTANT: Both must be ISO strings
  return {
    timeMin: timeMin.toISOString(),
    timeMax: now.toISOString()
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
