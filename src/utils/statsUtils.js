// Statistics calculation utilities
import { generateTimeSeriesData } from './chartUtils';
import { generateMultiLineData, getColorForEventType } from './multiLineChartUtils';

export const calculateStats = (eventList, timeRange, groupBy = 'days', dateMin = null, dateMax = null, selectedWeekday = null, disabledEvents = new Set()) => {
  // Filter by weekday if in weekday mode (applies to everything, enabled or not)
  let weekdayEvents = eventList;
  if (groupBy === 'weekday' && selectedWeekday !== null && selectedWeekday !== undefined) {
    weekdayEvents = eventList.filter(event => {
      if (event.start.dateTime) {
        const start = new Date(event.start.dateTime);
        return start.getDay() === selectedWeekday;
      }
      return false;
    });
  }

  let totalMinutes = 0;
  let enabledEventCount = 0;
  const eventsByDay = {};
  const minutesByTypeAll = {};      // includes disabled events, so they stay in the list
  const enabledMinutesByType = {};

  weekdayEvents.forEach(event => {
    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationMinutes = (end - start) / (1000 * 60);
      const eventType = event.summary || 'Untitled';

      minutesByTypeAll[eventType] = (minutesByTypeAll[eventType] || 0) + durationMinutes;

      // Totals only count enabled events
      if (!disabledEvents.has(eventType)) {
        totalMinutes += durationMinutes;
        enabledEventCount += 1;
        const dayKey = start.toLocaleDateString();
        eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + durationMinutes;
        enabledMinutesByType[eventType] = (enabledMinutesByType[eventType] || 0) + durationMinutes;
      }
    }
  });

  const totalHours = totalMinutes / 60;
  const avgHoursPerDay = (totalHours / Object.keys(eventsByDay).length) || 0;

  // Full list (enabled + disabled), top 10 by hours
  const eventsByType = Object.entries(minutesByTypeAll)
    .map(([name, minutes]) => ({
      name,
      hours: minutes / 60,
      enabled: !disabledEvents.has(name)
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  // Stable colors: based on rank among ALL events, so a color doesn't
  // change when other events are disabled
  const eventColorMap = {};
  eventsByType.forEach((event, index) => {
    eventColorMap[event.name] = getColorForEventType(event.name, index);
  });

  // Chart data only includes enabled events
  const multiLineResult = generateMultiLineData(eventList, timeRange, dateMin, dateMax, groupBy, selectedWeekday, disabledEvents);
  const colors = multiLineResult.eventTypes.map((eventType, index) =>
    eventColorMap[eventType] || getColorForEventType(eventType, index)
  );

  return {
    totalHours,
    avgHoursPerDay,
    eventCount: enabledEventCount,
    eventsByType,
    eventColorMap,
    timeSeriesData: generateTimeSeriesData(eventList, timeRange),
    multiLineData: multiLineResult.data,
    eventTypes: multiLineResult.eventTypes,
    eventColors: colors
  };
};