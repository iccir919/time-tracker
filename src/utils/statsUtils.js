// Statistics calculation utilities
import { generateTimeSeriesData } from './chartUtils';
import { generateMultiLineData, getColorForEventType } from './multiLineChartUtils';

// Filter events by type
export const filterEventsByType = (eventList, eventType) => {
  if (!eventType) return eventList;
  return eventList.filter(event => event.summary === eventType);
};

export const calculateStats = (eventList, timeRange, groupBy = 'days', dateMin = null, dateMax = null) => {
  let totalMinutes = 0;
  const eventsByDay = {};
  const eventsByType = {};

  eventList.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationMinutes = (end - start) / (1000 * 60);
      
      totalMinutes += durationMinutes;

      // Group by day
      const dayKey = start.toLocaleDateString();
      eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + durationMinutes;

      // Group by event summary (type)
      const eventType = event.summary || 'Untitled';
      eventsByType[eventType] = (eventsByType[eventType] || 0) + durationMinutes;
    }
  });

  const totalHours = totalMinutes / 60;
  const avgHoursPerDay = (totalHours / Object.keys(eventsByDay).length) || 0;

  // Generate multi-line chart data
  const multiLineResult = generateMultiLineData(eventList, timeRange, dateMin, dateMax, groupBy);
  const colors = multiLineResult.eventTypes.map((eventType, index) => 
    getColorForEventType(eventType, index)
  );

  return {
    totalHours,
    avgHoursPerDay,
    eventCount: eventList.length,
    eventsByType: Object.entries(eventsByType)
      .map(([name, minutes]) => ({
        name,
        hours: minutes / 60  // Keep full precision, don't round here
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10), // Limit to top 10 events
    timeSeriesData: generateTimeSeriesData(eventList, timeRange),
    multiLineData: multiLineResult.data,
    eventTypes: multiLineResult.eventTypes,
    eventColors: colors
  };
};