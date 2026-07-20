import React, { useState } from 'react';
import styles from './Calendar.module.css';

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => isSameDay(disabledDate, date));
  };

  const handlePrevMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date): void => {
    if (!isDisabled(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  const renderDays = (): React.ReactNode[] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInPrevMonth = getDaysInMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );

    const days: React.ReactNode[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        daysInPrevMonth - i
      );
      days.push(
        <button
          key={`prev-${i}`}
          type="button"
          className={`${styles.day} ${styles.otherMonth}`}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled(date)}
        >
          <span className={styles.dayNumber}>{daysInPrevMonth - i}</span>
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const classNames = [styles.day];
      
      if (isToday(date)) classNames.push(styles.today);
      if (isSelected(date)) classNames.push(styles.selected);
      if (isDisabled(date)) classNames.push(styles.disabled);

      days.push(
        <button
          key={`current-${day}`}
          type="button"
          className={classNames.join(' ')}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled(date)}
        >
          <span className={styles.dayNumber}>{day}</span>
        </button>
      );
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        day
      );
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          className={`${styles.day} ${styles.otherMonth}`}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled(date)}
        >
          <span className={styles.dayNumber}>{day}</span>
        </button>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navButton}
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className={styles.daysGrid}>
        {weekdayNames.map(weekday => (
          <div key={weekday} className={styles.weekdayHeader}>
            {weekday}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};
