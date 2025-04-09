import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/components/common/DatePicker.css';

const CustomDatePicker = ({
  startDate,
  endDate,
  onChange,
  showRangeSelect = false,
  showPresets = false,
  placeholder = 'Select date...',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges = [
    { label: 'Today', getValue: () => [new Date(), new Date()] },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return [yesterday, yesterday];
      },
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return [start, end];
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return [start, end];
      },
    },
    {
      label: 'This month',
      getValue: () => {
        const start = new Date();
        start.setDate(1);
        const end = new Date();
        return [start, end];
      },
    },
  ];

  const handlePresetClick = (preset) => {
    const [newStart, newEnd] = preset.getValue();
    onChange(newStart, newEnd);
    setIsOpen(false);
  };

  return (
    <div className="custom-datepicker-container">
      {showRangeSelect ? (
        <div className="date-range-picker">
          <DatePicker
            selected={startDate}
            onChange={(date) => onChange(date, endDate)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start date"
            className="datepicker-input"
          />
          <span className="date-range-separator">to</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => onChange(startDate, date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End date"
            className="datepicker-input"
          />
        </div>
      ) : (
        <DatePicker
          selected={startDate}
          onChange={(date) => onChange(date)}
          placeholderText={placeholder}
          className="datepicker-input"
        />
      )}

      {showPresets && (
        <div className="datepicker-presets">
          {presetRanges.map((preset, index) => (
            <button
              key={index}
              className="preset-button"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;