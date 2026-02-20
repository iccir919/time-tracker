import React from 'react';

const EventsBreakdown = ({ eventsByType, totalHours, onEventClick, selectedEvent, eventColors, eventTypes, title = "Events Breakdown", isComparison = false, avgHoursPerDay, eventCount }) => {
  if (!eventsByType || eventsByType.length === 0) {
    return null;
  }

  // Create a map of event names to colors
  const colorMap = {};
  if (eventTypes && eventColors) {
    eventTypes.forEach((type, index) => {
      colorMap[type] = eventColors[index];
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        {selectedEvent && !isComparison && (
          <button
            onClick={() => onEventClick(null)}
            className="text-sm text-gray-900 hover:text-black font-medium"
          >
            Clear Filter ✕
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6 pb-4 border-b border-gray-200">
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

      <div className="space-y-3">
        {eventsByType.map((event, index) => {
          const percentage = Math.round((event.hours / totalHours) * 100);
          const isSelected = selectedEvent === event.name;
          const isOtherSelected = selectedEvent && !isSelected;
          const eventColor = colorMap[event.name] || '#000000'; // Default to indigo

          return (
            <button
              key={index}
              onClick={() => onEventClick(isSelected ? null : event.name)}
              className={`w-full text-left transition-all ${
                isOtherSelected ? 'opacity-40' : 'opacity-100'
              } ${
                isSelected ? 'ring-2 ring-gray-900 bg-gray-100' : 'hover:bg-gray-50'
              } rounded-lg p-3 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Color indicator matching chart */}
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: eventColor }}
                  />
                  <span className="font-semibold text-gray-900">
                    {event.name}
                  </span>
                  {isSelected && (
                    <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
                      Filtered
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{percentage}%</span>
                  <span className="font-bold text-gray-900">{parseFloat(event.hours.toFixed(2))}h</span>
                </div>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: eventColor
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {selectedEvent && (
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Click event again or "Clear Filter" to see all events
        </p>
      )}
    </div>
  );
};

export default EventsBreakdown;