import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';
import Header from './components/Header';
import CalendarSelector from './components/CalendarSelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import DateRangePicker from './components/DateRangePicker';
import GroupBySelector from './components/GroupBySelector';
import TimeSeriesChart from './components/TimeSeriesChart';
import EventsBreakdown from './components/EventsBreakdown';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { getGraphTitle } from './utils/chartUtils';
import { calculateStats, filterEventsByType } from './utils/statsUtils';

const App = () => {
  const {
    isSignedIn,
    calendars,
    selectedCalendarId,
    setSelectedCalendarId,
    events,
    stats,
    loading,
    error,
    timeRange,
    customDateRange,
    currentDateRange,
    setTimeRange,
    applyCustomDateRange,
    handleSignIn,
    handleSignOut
  } = useGoogleCalendar();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);
  const [groupBy, setGroupBy] = useState('days'); // days, weeks, months
  const [localStats, setLocalStats] = useState(null); // Override hook stats when groupBy changes

  // Auto-adjust groupBy when timeRange changes
  useEffect(() => {
    switch (timeRange) {
      case 'week':
        setGroupBy('days'); // Week: only daily
        break;
      case 'month':
        setGroupBy('days'); // Month: default to daily
        break;
      case 'year':
        setGroupBy('days'); // Year: default to daily (can switch to week or month)
        break;
      case 'custom':
        setGroupBy('days'); // Custom: default to daily (can switch to week or month)
        break;
      default:
        setGroupBy('days');
    }
  }, [timeRange]);

  // Recalculate stats when groupBy changes
  useEffect(() => {
    if (!events || events.length === 0 || !currentDateRange) {
      setLocalStats(null);
      return;
    }
    
    const recalculatedStats = calculateStats(
      events,
      timeRange,
      groupBy,
      currentDateRange.timeMin,
      currentDateRange.timeMax
    );
    setLocalStats(recalculatedStats);
    
    // Also recalculate filtered stats if filtering is active
    if (selectedEventType) {
      const filtered = filterEventsByType(events, selectedEventType);
      const newFilteredStats = calculateStats(
        filtered,
        timeRange,
        groupBy,
        currentDateRange.timeMin,
        currentDateRange.timeMax
      );
      const originalEventIndex = recalculatedStats.eventTypes.indexOf(selectedEventType);
      if (originalEventIndex !== -1) {
        newFilteredStats.eventColors = [recalculatedStats.eventColors[originalEventIndex]];
      }
      setFilteredStats(newFilteredStats);
    } else {
      setFilteredStats(null);
    }
  }, [groupBy, events, timeRange, currentDateRange, selectedEventType]);

  const handleCustomClick = () => {
    setShowDatePicker(true);
  };

  const handleApplyCustomRange = (dateRange) => {
    applyCustomDateRange(dateRange);
  };

  const handleEventClick = (eventType) => {
    setSelectedEventType(eventType);
  };

  if (!isSignedIn) {
    return <SignInScreen onSignIn={handleSignIn} />;
  }

  const displayStats = filteredStats || localStats || stats;
  const hasEvents = events && events.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Header onSignOut={handleSignOut} />
          </div>

          {/* Controls Bar */}
          <div className="bg-white border-b border-gray-200 p-6">
            {/* Calendar Selector */}
            <CalendarSelector
              calendars={calendars}
              selectedCalendarId={selectedCalendarId}
              onChange={setSelectedCalendarId}
              loading={loading}
            />

            {/* Time Range Selector */}
            <TimeRangeSelector 
              timeRange={timeRange} 
              onChange={setTimeRange}
              onCustomClick={handleCustomClick}
            />
            
            {/* Current date range display */}
            {currentDateRange && (
              <p className="text-sm text-gray-600 text-center mt-2">
                {new Date(currentDateRange.timeMin).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })} - {new Date(currentDateRange.timeMax).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Main Content Area */}
          <div className="p-6 md:p-8">
            <ErrorMessage message={error} />

            {loading && <LoadingSpinner />}

            {!loading && !hasEvents && (
              <EmptyState timeRange={timeRange} customDateRange={customDateRange} />
            )}

            {!loading && hasEvents && displayStats && (
              <>
                {/* Chart - Full Width */}
                <TimeSeriesChart 
                  currentData={displayStats.multiLineData}
                  comparisonData={null}
                  eventTypes={displayStats.eventTypes}
                  colors={displayStats.eventColors}
                  title={getGraphTitle(timeRange, customDateRange?.label)}
                  showComparison={false}
                  comparisonLabel=""
                />

                {/* Group By - below chart */}
                <GroupBySelector
                  groupBy={groupBy}
                  onChange={setGroupBy}
                  timeRange={timeRange}
                />

                {/* Events Breakdown - Full Width */}
                <EventsBreakdown 
                  eventsByType={displayStats.eventsByType}
                  totalHours={displayStats.totalHours}
                  onEventClick={handleEventClick}
                  selectedEvent={selectedEventType}
                  eventColors={displayStats.eventColors}
                  eventTypes={displayStats.eventTypes}
                  title="Events Breakdown"
                  avgHoursPerDay={displayStats.avgHoursPerDay}
                  eventCount={displayStats.eventCount}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <DateRangePicker
          onApply={handleApplyCustomRange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default App;