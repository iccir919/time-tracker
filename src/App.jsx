import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';
import Header from './components/Header';
import CalendarSelector from './components/CalendarSelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import DateRangePicker from './components/DateRangePicker';
import DateRangeDisplay from './components/DateRangeDisplay';
import ComparisonSelector from './components/ComparisonSelector';
import GroupBySelector from './components/GroupBySelector';
import ComparisonStats from './components/ComparisonStats';
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

  // Determine if grouping selector should be shown
  const showGrouping = timeRange === 'year' || timeRange === 'custom';

  if (!isSignedIn) {
    return <SignInScreen onSignIn={handleSignIn} />;
  }

  const displayStats = filteredStats || stats;
  const displayComparisonStats = filteredComparisonStats || comparisonStats;
  const hasEvents = events && events.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <Header onSignOut={handleSignOut} />

          <CalendarSelector
            calendars={calendars}
            selectedCalendarId={selectedCalendarId}
            onChange={setSelectedCalendarId}
            loading={loading}
          />
          
          {/* Time Range and Group By in same section */}
          <div className="mb-6">
            <TimeRangeSelector 
              timeRange={timeRange} 
              onChange={setTimeRange}
            />
            
            {/* Group By selector - only show for Year/Custom */}
            {showGrouping && (
              <GroupBySelector
                groupBy={groupBy}
                onChange={setGroupBy}
                timeRange={timeRange}
              />
            )}
          </div>

          <DateRangeDisplay 
            timeRange={timeRange}
            customDateRange={customDateRange}
            onCustomClick={handleCustomClick}
          />

          {/* Comparison Settings - moved to top */}
          <ComparisonSelector
            comparisonMode={comparisonMode}
            onChange={setComparisonMode}
            timeRange={timeRange}
            showOnGraph={showComparisonOnGraph}
            onShowOnGraphChange={setShowComparisonOnGraph}
          />

          <ErrorMessage message={error} />

          {loading && <LoadingSpinner />}

          {!loading && !hasEvents && (
            <EmptyState timeRange={timeRange} customDateRange={customDateRange} />
          )}

          {!loading && hasEvents && displayStats && (
            <>

              {/* Events breakdown above chart - acts as interactive legend */}
              <div className={`grid ${comparisonMode !== 'none' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
                {/* Current Period Breakdown */}
                <EventsBreakdown 
                  eventsByType={displayStats.eventsByType}
                  totalHours={displayStats.totalHours}
                  onEventClick={handleEventClick}
                  selectedEvent={selectedEventType}
                  eventColors={displayStats.eventColors}
                  eventTypes={displayStats.eventTypes}
                  title="Current Period"
                  avgHoursPerDay={displayStats.avgHoursPerDay}
                  eventCount={displayStats.eventCount}
                />

                {/* Comparison Period Breakdown - use CURRENT period's colors for consistency */}
                {comparisonMode !== 'none' && displayComparisonStats && (
                  <EventsBreakdown 
                    eventsByType={displayComparisonStats.eventsByType}
                    totalHours={displayComparisonStats.totalHours}
                    onEventClick={handleEventClick}
                    selectedEvent={selectedEventType}
                    eventColors={displayStats.eventColors}
                    eventTypes={displayStats.eventTypes}
                    title={`Comparison Period (${getComparisonLabel(timeRange, comparisonMode)})`}
                    avgHoursPerDay={displayComparisonStats.avgHoursPerDay}
                    eventCount={displayComparisonStats.eventCount}
                    isComparison={true}
                  />
                )}
              </div>

              {/* Chart */}
              <TimeSeriesChart 
                currentData={displayStats.multiLineData}
                comparisonData={displayComparisonStats?.multiLineData}
                eventTypes={displayStats.eventTypes}
                colors={displayStats.eventColors}
                title={getGraphTitle(timeRange, customDateRange?.label)}
                showComparison={showComparisonOnGraph}
                comparisonLabel={getComparisonLabel(timeRange, comparisonMode)}
              />

              {/* Comparison Stats - change from previous */}
              {comparisonMode !== 'none' && displayComparisonStats && (
                <ComparisonStats
                  currentStats={stats}
                  comparisonStats={displayComparisonStats}
                  comparisonLabel={getComparisonLabel(timeRange, comparisonMode)}
                  comparisonMode={comparisonMode}
                  timeRange={timeRange}
                  customDateRange={customDateRange}
                />
              )}
            </>
          )}
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