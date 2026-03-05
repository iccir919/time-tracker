import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';
import Header from './components/Header';
import CalendarSelector from './components/CalendarSelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import DateRangePicker from './components/DateRangePicker';
import TimeSeriesChart from './components/TimeSeriesChart';
import EventsBreakdown from './components/EventsBreakdown';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { getGraphTitle } from './utils/chartUtils';
import { calculateStats } from './utils/statsUtils';
import { getComparisonDateRange, getComparisonLabel, filterEventsByType } from './utils/comparisonUtils';
import { googleCalendarService } from './utils/googleCalendarService';

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
  const [comparisonMode, setComparisonMode] = useState('none'); // Start with comparison OFF (set to 'none')
  const [showComparisonOnGraph, setShowComparisonOnGraph] = useState(false); // Toggle for showing comparison on graph
  const [comparisonStats, setComparisonStats] = useState(null);
  const [comparisonEvents, setComparisonEvents] = useState([]);
  const [comparisonDateRange, setComparisonDateRange] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);
  const [filteredComparisonStats, setFilteredComparisonStats] = useState(null);
  const [groupBy, setGroupBy] = useState('days'); // days, weeks, months

  // Auto-adjust groupBy when timeRange changes
  useEffect(() => {
    switch (timeRange) {
      case 'week':
        setGroupBy('days'); // Week only supports daily
        break;
      case 'month':
        setGroupBy('days'); // Month defaults to daily (can switch to weekly)
        break;
      case 'year':
        setGroupBy('weeks'); // Year defaults to weekly (can switch to monthly)
        break;
      case 'custom':
        setGroupBy('days'); // Custom defaults to daily
        break;
      default:
        setGroupBy('days');
    }
  }, [timeRange]);

  // Fetch comparison data when comparison mode changes
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (comparisonMode === 'none' || !isSignedIn) {
        setComparisonStats(null);
        return;
      }

      const comparisonRange = getComparisonDateRange(timeRange, comparisonMode, customDateRange);
      if (!comparisonRange) {
        setComparisonStats(null);
        return;
      }

      try {
        const compEvents = await googleCalendarService.fetchEvents(
          comparisonRange.timeMin,
          comparisonRange.timeMax,
          selectedCalendarId
        );
        setComparisonEvents(compEvents); // Store events for filtering
        setComparisonDateRange(comparisonRange); // Store date range
        const compStats = calculateStats(compEvents, timeRange, groupBy, comparisonRange.timeMin, comparisonRange.timeMax);
        setComparisonStats(compStats);
      } catch (err) {
        console.error('Failed to fetch comparison data:', err);
        setComparisonStats(null);
        setComparisonEvents([]);
        setComparisonDateRange(null);
      }
    };

    fetchComparisonData();
  }, [comparisonMode, timeRange, isSignedIn, selectedCalendarId, customDateRange, groupBy]);

  // Filter events and recalculate stats when event type is selected
  useEffect(() => {
    if (!events || events.length === 0) {
      setFilteredStats(null);
      setFilteredComparisonStats(null);
      return;
    }

    if (!selectedEventType) {
      setFilteredStats(stats);
      setFilteredComparisonStats(comparisonStats);
      return;
    }

    // Filter current period
    const filtered = filterEventsByType(events, selectedEventType);
    const newStats = calculateStats(
      filtered, 
      timeRange, 
      groupBy,
      currentDateRange?.timeMin,
      currentDateRange?.timeMax
    );
    
    // Preserve the original color for the selected event
    const originalEventIndex = stats.eventTypes.indexOf(selectedEventType);
    if (originalEventIndex !== -1) {
      newStats.eventColors = [stats.eventColors[originalEventIndex]];
    }
    
    setFilteredStats(newStats);

    // Filter comparison period if it exists
    if (comparisonEvents && comparisonEvents.length > 0) {
      const filteredComparison = filterEventsByType(comparisonEvents, selectedEventType);
      const newComparisonStats = calculateStats(
        filteredComparison, 
        timeRange, 
        groupBy,
        comparisonDateRange?.timeMin,
        comparisonDateRange?.timeMax
      );
      
      // Use same color as current period
      if (originalEventIndex !== -1) {
        newComparisonStats.eventColors = [stats.eventColors[originalEventIndex]];
      }
      
      setFilteredComparisonStats(newComparisonStats);
    } else {
      setFilteredComparisonStats(comparisonStats);
    }
  }, [selectedEventType, events, stats, timeRange, groupBy, comparisonEvents, comparisonStats, currentDateRange, comparisonDateRange]);

  const handleCustomClick = () => {
    setShowDatePicker(true);
  };

  const handleApplyCustomRange = (dateRange) => {
    applyCustomDateRange(dateRange);
    // Comparison will work for custom ranges too
  };

  const handleEventClick = (eventType) => {
    setSelectedEventType(eventType);
  };

  if (!isSignedIn) {
    return <SignInScreen onSignIn={handleSignIn} />;
  }

  const displayStats = filteredStats || stats;
  const displayComparisonStats = filteredComparisonStats || comparisonStats;
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