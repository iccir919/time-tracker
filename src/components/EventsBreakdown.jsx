import React from 'react';

const EventsBreakdown = ({
  eventsByType,
  totalHours,
  eventColorMap = {},
  title = "Events Breakdown",
  avgHoursPerDay,
  eventCount,
  disabledEvents = new Set(),
  onToggleEventDisable
}) => {
  if (!eventsByType || eventsByType.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Event List: click an event to show or hide it on the graph */}
      <div className="space-y-3 mb-6">
        {eventsByType.map((event) => {
          const isDisabled = disabledEvents.has(event.name);
          const percentage = !isDisabled && totalHours > 0
            ? Math.round((event.hours / totalHours) * 100)
            : 0;
          const eventColor = eventColorMap[event.name] || '#000000';

          return (
            <button
              key={event.name}
              type="button"
              onClick={() => onToggleEventDisable(event.name)}
              title={isDisabled ? 'Click to show on graph' : 'Click to hide from graph'}
              className={`w-full text-left rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all ${
                isDisabled ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
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
            </button>
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
        💡 Click an event to hide or show it on the graph
      </p>
    </div>
  );
};

export default EventsBreakdown;