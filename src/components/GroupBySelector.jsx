import React, { useState } from 'react';

const GroupBySelector = ({ groupBy, onChange, timeRange, selectedWeekday, onWeekdayChange }) => {
  const [showWeekdayPicker, setShowWeekdayPicker] = useState(false);

  // Determine which grouping options are available based on time range
  const getGroupingOptions = () => {
    switch (timeRange) {
      case 'week':
        // Week: Just Day (only 7 days, not enough for meaningful grouping)
        return [
          { value: 'days', label: 'Day' }
        ];
      
      case 'month':
        // Month: Day, Week, or Weekday
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' },
          { value: 'weekday', label: 'Weekday' }
        ];
      
      case 'year':
        // Year: Day, Week, Month, or Weekday
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' },
          { value: 'months', label: 'Month' },
          { value: 'weekday', label: 'Weekday' }
        ];
      
      case 'custom':
        // Custom: All options
        return [
          { value: 'days', label: 'Day' },
          { value: 'weeks', label: 'Week' },
          { value: 'months', label: 'Month' },
          { value: 'weekday', label: 'Weekday' }
        ];
      
      default:
        return null;
    }
  };

  const options = getGroupingOptions();

  // Don't show if no options or only one option
  if (!options || options.length <= 1) {
    return null;
  }

  const weekdays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const handleGroupByClick = (value) => {
    if (value === 'weekday') {
      setShowWeekdayPicker(true);
      // If no weekday selected yet, default to Monday
      if (selectedWeekday === null || selectedWeekday === undefined) {
        onWeekdayChange(1); // Monday
      }
    } else {
      setShowWeekdayPicker(false);
    }
    onChange(value);
  };

  const handleWeekdayClick = (day) => {
    console.log('Weekday clicked:', day);
    onWeekdayChange(day);
  };

  const getWeekdayLabel = () => {
    if (selectedWeekday === null || selectedWeekday === undefined) return 'Weekday';
    const day = weekdays.find(d => d.value === selectedWeekday);
    return day ? day.label : 'Weekday';
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Group by:</span>
        <div className="flex gap-2">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => handleGroupByClick(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                groupBy === option.value
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.value === 'weekday' && groupBy === 'weekday' ? getWeekdayLabel() : option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday Picker - shows when weekday mode is active */}
      {groupBy === 'weekday' && (
        <div className="flex gap-1">
          {weekdays.map(day => (
            <button
              key={day.value}
              onClick={() => handleWeekdayClick(day.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedWeekday === day.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupBySelector;