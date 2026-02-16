import React, { useState, useEffect } from 'react';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import SignInScreen from './components/SignInScreen';
import Header from './components/Header';
import CalendarSelector from './components/CalendarSelector';
import TimeRangeSelector from './components/TimeRangeSelector';
import DateRangePicker from './components/DateRangePicker';
import DateRangeDisplay from './components/DateRangeDisplay';
import ChartTypeToggle from './components/ChartTypeToggle';
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
    setTimeRange,
    applyCustomDateRange,
    handleSignIn,
    handleSignOut
  } = useGoogleCalendar();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartStyle, setChartStyle] = useState('stacked');
  const [chartType, setChartType] = useState('bar');
  const [comparisonMode, setComparisonMode] = useState('previous');
  const [comparisonStats, setComparisonStats] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);

  // Fetch comparison data when comparison mode changes
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!isSignedIn) {
        setComparisonStats(null);
        return;
      }

      const comparisonRange = getComparisonDateRange(timeRange, comparisonMode, customDateRange);
      if (!comparisonRange) {
        setComparisonStats(null);
        return;
      }

      try {
        const comparisonEvents = await googleCalendarService.fetchEvents(
          comparisonRange.timeMin,
          comparisonRange.timeMax,
          selectedCalendarId
        );
        const compStats = calculateStats(comparisonEvents, timeRange);
        setComparisonStats(compStats);
      } catch (err) {
        console.error('Failed to fetch comparison data:', err);
        setComparisonStats(null);
      }
    };

    fetchComparisonData();
  }, [comparisonMode, timeRange, isSignedIn, selectedCalendarId, customDateRange]);

  // Filter events and recalculate stats when event type is selected
  useEffect(() => {
    if (!events || events.length === 0) {
      setFilteredStats(null);
      return;
    }

    if (!selectedEventType) {
      setFilteredStats(stats);
      return;
    }

    const filtered = filterEventsByType(events, selectedEventType);
    const newStats = calculateStats(filtered, timeRange);
    
    // Preserve the original color for the selected event
    const originalEventIndex = stats.eventTypes.indexOf(selectedEventType);
    if (originalEventIndex !== -1) {
      newStats.eventColors = [stats.eventColors[originalEventIndex]];
    }
    
    setFilteredStats(newStats);
  }, [selectedEventType, events, stats, timeRange]);

  const handleCustomClick = () => {
    setShowDatePicker(true);
  };

  const handleApplyCustomRange = (dateRange) => {
    applyCustomDateRange(dateRange);
    // Comparison will be hidden for custom ranges automatically
  };

  const handleEventClick = (eventType) => {
    setSelectedEventType(eventType);
  };

  if (!isSignedIn) {
    return <SignInScreen onSignIn={handleSignIn} />;
  }

  const displayStats = filteredStats || stats;
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
          
          <TimeRangeSelector 
            timeRange={timeRange} 
            onChange={setTimeRange}
          />

          <DateRangeDisplay 
            timeRange={timeRange}
            customDateRange={customDateRange}
            onCustomClick={handleCustomClick}
          />

          <ErrorMessage message={error} />

          {loading && <LoadingSpinner />}

          {!loading && !hasEvents && (
            <EmptyState timeRange={timeRange} customDateRange={customDateRange} />
          )}

          {!loading && hasEvents && displayStats && (
            <>
              {/* Events breakdown ABOVE chart */}
              <EventsBreakdown 
                eventsByType={stats.eventsByType}
                totalHours={stats.totalHours}
                onEventClick={handleEventClick}
                selectedEvent={selectedEventType}
                eventColors={stats.eventColors}
                eventTypes={stats.eventTypes}
              />
              
              {/* Chart */}
              <TimeSeriesChart 
                data={displayStats.multiLineData}
                eventTypes={displayStats.eventTypes}
                colors={displayStats.eventColors}
                title={getGraphTitle(timeRange, customDateRange?.label)}
                chartStyle={chartStyle}
                chartType={chartType}
              />

              {/* Chart controls BELOW chart */}
              <ChartTypeToggle 
                chartStyle={chartStyle}
                chartType={chartType}
                onStyleChange={setChartStyle}
                onTypeChange={setChartType}
              />

              {/* Comparison at the bottom */}
              <ComparisonStats
                currentStats={stats}
                comparisonStats={comparisonStats}
                comparisonLabel={getComparisonLabel(timeRange, comparisonMode)}
                comparisonMode={comparisonMode}
                onComparisonChange={setComparisonMode}
                timeRange={timeRange}
                customDateRange={customDateRange}
              />
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