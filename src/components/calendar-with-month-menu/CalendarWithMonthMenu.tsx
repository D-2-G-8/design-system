import React, { useState } from 'react';
import styles from './CalendarWithMonthMenu.module.css';

export interface CalendarWithMonthMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarWithMonthMenu({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
  className,
  ...props
}: CalendarWithMonthMenuProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
    setIsMonthDropdownOpen(false);
  };

  const handleDateClick = (date: Date) => {
    if (!isDisabled(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInPrevMonth = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    
    const days: { date: Date; isOtherMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i),
        isOtherMonth: true
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isOtherMonth: false
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isOtherMonth: true
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`${styles.calendar} ${className || ''}`} {...props}>
      <div className={styles.header}>
        <button
          type="button"
          className={`${styles.navigationButton} ${styles.prevButton}`}
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        
        <div className={styles.monthSelector}>
          <button
            type="button"
            className={styles.monthButton}
            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            aria-expanded={isMonthDropdownOpen}
            aria-haspopup="listbox"
          >
            {months[currentDate.getMonth()]}
          </button>
          {isMonthDropdownOpen && (
            <div className={styles.monthDropdown} role="listbox">
              {months.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  className={styles.monthOption}
                  onClick={() => handleMonthSelect(index)}
                  role="option"
                  aria-selected={index === currentDate.getMonth()}
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.yearDisplay}>{currentDate.getFullYear()}</div>

        <button
          type="button"
          className={`${styles.navigationButton} ${styles.nextButton}`}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {weekdays.map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {calendarDays.map(({ date, isOtherMonth }, index) => {
          const disabled = isDisabled(date);
          const today = isToday(date);
          const selected = selectedDate && isSameDay(date, selectedDate);

          return (
            <div key={index} className={styles.day}>
              <button
                type="button"
                className={`${styles.dayButton} ${today ? styles.dayToday : ''} ${selected ? styles.daySelected : ''} ${disabled ? styles.dayDisabled : ''} ${isOtherMonth ? styles.dayOtherMonth : ''}`}
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                aria-label={date.toLocaleDateString()}
                aria-current={today ? 'date' : undefined}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
