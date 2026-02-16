import React from 'react';

const CalendarSelector = ({ calendars, selectedCalendarId, onChange, loading }) => {
  if (!calendars || calendars.length === 0) {
    return null;
  }

  // Don't show selector if only one calendar
  if (calendars.length === 1) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Calendar
        </label>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-lg">📅</span>
          <span className="text-sm font-medium text-gray-700">{calendars[0].name}</span>
        </div>
      </div>
    );
  }

  const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selected Calendar
      </label>
      <div className="relative">
        <select
          value={selectedCalendarId}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
        >
          {calendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.primary ? '⭐ ' : ''}{calendar.name}
            </option>
          ))}
        </select>
        
        {/* Calendar icon on left */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-lg">📅</span>
        </div>
        
        {/* Dropdown arrow on right */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Minimal info below */}
      {selectedCalendar && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          {calendars.length} calendar{calendars.length !== 1 ? 's' : ''} available
          {selectedCalendar.primary && ' • Primary calendar selected'}
        </p>
      )}
    </div>
  );
};

export default CalendarSelector;