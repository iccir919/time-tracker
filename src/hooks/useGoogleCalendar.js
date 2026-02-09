import { useState, useEffect } from 'react';
import { googleCalendarService } from '../utils/googleCalendarService';
import { getDateRange } from '../utils/dateUtils';
import { calculateStats } from '../utils/statsUtils';

export const useGoogleCalendar = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [customDateRange, setCustomDateRange] = useState(null);

  // Initialize Google API on mount
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        await googleCalendarService.initialize();
        // Check if already signed in (has token)
        setIsSignedIn(googleCalendarService.isSignedIn());
      } catch (err) {
        setError('Failed to initialize Google API. Please check your credentials.');
        console.error(err);
      }
    };

    initializeAPI();
  }, []);

  // Fetch calendar list when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchCalendarList();
    }
  }, [isSignedIn]);

  // Fetch events when calendar or time range changes
  useEffect(() => {
    if (isSignedIn && selectedCalendarId) {
      fetchEvents();
    }
  }, [isSignedIn, timeRange, customDateRange, selectedCalendarId]);

  const fetchCalendarList = async () => {
    try {
      const calendarList = await googleCalendarService.fetchCalendarList();
      setCalendars(calendarList);
      
      // Auto-select primary calendar by default
      const primaryCalendar = calendarList.find(cal => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendarId(primaryCalendar.id);
      } else if (calendarList.length > 0) {
        setSelectedCalendarId(calendarList[0].id);
      }
    } catch (err) {
      setError('Failed to fetch calendar list. Please try again.');
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let timeMin, timeMax;
      
      // Use custom date range if set, otherwise use preset range
      if (timeRange === 'custom' && customDateRange) {
        timeMin = customDateRange.timeMin;
        timeMax = customDateRange.timeMax;
      } else {
        const range = getDateRange(timeRange);
        timeMin = range.timeMin;
        timeMax = range.timeMax;
      }
      
      const fetchedEvents = await googleCalendarService.fetchEvents(
        timeMin, 
        timeMax, 
        selectedCalendarId
      );
      setEvents(fetchedEvents);
      setStats(calculateStats(fetchedEvents, timeRange));
    } catch (err) {
      setError('Failed to fetch calendar events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await googleCalendarService.signIn();
      setIsSignedIn(true);
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    }
  };

  const handleSignOut = () => {
    googleCalendarService.signOut();
    setIsSignedIn(false);
    setCalendars([]);
    setSelectedCalendarId('primary');
    setEvents([]);
    setStats(null);
  };

  const applyCustomDateRange = (dateRange) => {
    setCustomDateRange(dateRange);
    setTimeRange('custom');
  };

  return {
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
    handleSignOut,
    refetchEvents: fetchEvents
  };
};
