import React from 'react';

const EventsBreakdown = ({ eventsByType, totalHours, onEventClick, selectedEvent }) => {
  if (!eventsByType || eventsByType.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-bold text-gray-900">Events Breakdown</h2>
        </div>
        {selectedEvent && (
          <button
            onClick={() => onEventClick(null)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear Filter ✕
          </button>
        )}
      </div>

      <div className="space-y-3">
        {eventsByType.map((event, index) => {
          const percentage = Math.round((event.hours / totalHours) * 100);
          const isSelected = selectedEvent === event.name;
          const isOtherSelected = selectedEvent && !isSelected;

          return (
            <button
              key={index}
              onClick={() => onEventClick(isSelected ? null : event.name)}
              className={`w-full text-left transition-all ${
                isOtherSelected ? 'opacity-40' : 'opacity-100'
              } ${
                isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
              } rounded-lg p-3 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {event.name}
                  </span>
                  {isSelected && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      Filtered
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{percentage}%</span>
                  <span className="font-bold text-indigo-600">{event.hours}h</span>
                </div>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                    isSelected ? 'bg-indigo-600' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${percentage}%` }}
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
