import { useState, useEffect } from 'react';
import { googleCalendarService } from '../utils/googleCalendarService';
import { getDateRange } from '../utils/dateUtils';
import { calculateStats } from '../utils/statsUtils';

export const useGoogleCalendar = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarIdState] = useState(() => {
    // Load from localStorage or default to 'primary'
    return localStorage.getItem('lastSelectedCalendarId') || 'primary';
  });

  // Wrapper to save to localStorage when calendar changes
  const setSelectedCalendarId = (calendarId) => {
    localStorage.setItem('lastSelectedCalendarId', calendarId);
    setSelectedCalendarIdState(calendarId);
  };
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('custom');
  const [customDateRange, setCustomDateRange] = useState(() => {
    // Default to last 90 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);
    return {
      label: 'Last 90 Days',
      timeMin: start.toISOString(),
      timeMax: end.toISOString()
    };
  });
  const [currentDateRange, setCurrentDateRange] = useState(null); // Store the actual min/max dates

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
      
      // Keep the last selected calendar if it still exists,
      // otherwise fall back to the primary (default) calendar
      const savedId = localStorage.getItem('lastSelectedCalendarId');
      const savedStillExists = savedId && calendarList.some(cal => cal.id === savedId);

      if (savedStillExists) {
        setSelectedCalendarIdState(savedId);
      } else {
        const primaryCalendar = calendarList.find(cal => cal.primary);
        if (primaryCalendar) {
          setSelectedCalendarIdState(primaryCalendar.id);
        } else if (calendarList.length > 0) {
          setSelectedCalendarIdState(calendarList[0].id);
        }
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
      
      // Store the actual date range used
      setCurrentDateRange({ timeMin, timeMax });
      
      setEvents(fetchedEvents);
      setStats(calculateStats(fetchedEvents, timeRange, 'days', timeMin, timeMax));
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
    currentDateRange,
    setTimeRange,
    applyCustomDateRange,
    handleSignIn,
    handleSignOut,
    refetchEvents: fetchEvents
  };
};