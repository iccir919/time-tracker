import React, { useState } from 'react';

// Colors offered when clicking the square next to an event name
const COLOR_CHOICES = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853',
  '#FF6D01', '#46BDC6', '#7BAAF7', '#F07B72',
  '#FDD663', '#81C995', '#9334E6', '#E91E8C',
  '#795548', '#607D8B', '#9AA0A6', '#111827'
];

const EventsBreakdown = ({
  eventsByType,
  totalHours,
  eventColorMap = {},
  title = "Events Breakdown",
  avgHoursPerDay,
  eventCount,
  disabledEvents = new Set(),
  onToggleEventDisable,
  customColors = {},
  onColorChange
}) => {
  const [openPickerFor, setOpenPickerFor] = useState(null);

  if (!eventsByType || eventsByType.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Event List: click an event to show or hide it, click its square to change its color */}
      <div className="space-y-3 mb-6">
        {eventsByType.map((event) => {
          const isDisabled = disabledEvents.has(event.name);
          const percentage = !isDisabled && totalHours > 0
            ? Math.round((event.hours / totalHours) * 100)
            : 0;
          const eventColor = customColors[event.name] || eventColorMap[event.name] || '#000000';
          const isPickerOpen = openPickerFor === event.name;

          return (
            <div
              key={event.name}
              role="button"
              tabIndex={0}
              onClick={() => onToggleEventDisable(event.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleEventDisable(event.name);
                }
              }}
              title={isDisabled ? 'Click to show on graph' : 'Click to hide from graph'}
              className="relative w-full text-left rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div className={`transition-all ${isDisabled ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Color square: click to pick a color */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPickerFor(isPickerOpen ? null : event.name);
                      }}
                      title="Change color"
                      aria-label={`Change color for ${event.name}`}
                      className="w-4 h-4 rounded-sm flex-shrink-0 ring-1 ring-black/10 hover:ring-2 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: isDisabled ? '#D1D5DB' : eventColor }}
                    />
                    <span className={`font-semibold text-gray-900 ${isDisabled ? 'line-through' : ''}`}>
                      {event.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {isDisabled ? '' : `${percentage}%`}
                    </span>
                    <span className="font-bold text-gray-900 w-14 text-right">
                      {parseFloat(event.hours.toFixed(2))}h
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: eventColor }}
                  />
                </div>
              </div>

              {/* Color picker popover */}
              {isPickerOpen && (
                <>
                  {/* Click anywhere outside to close */}
                  <div
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPickerFor(null);
                    }}
                  />
                  <div
                    className="absolute left-3 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_CHOICES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            onColorChange(event.name, color);
                            setOpenPickerFor(null);
                          }}
                          aria-label={`Use color ${color}`}
                          className={`w-6 h-6 rounded-md ring-1 ring-black/10 hover:scale-110 transition-transform ${
                            eventColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-gray-900' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {customColors[event.name] && (
                      <button
                        type="button"
                        onClick={() => {
                          onColorChange(event.name, null);
                          setOpenPickerFor(null);
                        }}
                        className="mt-3 text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Summary (enabled events only) */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">
            {parseFloat(totalHours.toFixed(1))}h
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Avg/Day</p>
          <p className="text-lg font-bold text-gray-900">
            {parseFloat(avgHoursPerDay.toFixed(1))}h
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Events</p>
          <p className="text-lg font-bold text-gray-900">
            {eventCount}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        💡 Click an event to hide or show it. Click its color square to change the color.
      </p>
    </div>
  );
};

export default EventsBreakdown;