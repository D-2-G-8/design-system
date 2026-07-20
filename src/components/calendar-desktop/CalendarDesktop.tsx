import React from 'react';
import styles from './CalendarDesktop.module.css';

export interface CalendarDesktopProps extends React.HTMLAttributes<HTMLDivElement> {
  types: 'double';
}

export const CalendarDesktop: React.FC<CalendarDesktopProps> = ({
  types,
  className,
  ...props
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = (monthOffset: number) => {
    const targetMonth = currentMonth + monthOffset;
    const targetYear = currentYear + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    const daysInMonth = getDaysInMonth(normalizedMonth, targetYear);
    const firstDay = getFirstDayOfMonth(normalizedMonth, targetYear);

    const days: (number | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const isCurrentMonth = normalizedMonth === currentMonth && targetYear === currentYear;

    return (
      <div key={monthOffset} className={styles.calendarGrid}>
        <div className={styles.calendarHeader}>
          <button type="button" className={styles.calendarNavigationButton}>
            ‹
          </button>
          <div className={styles.calendarNavigation}>
            <span className={styles.calendarMonthLabel}>{monthNames[normalizedMonth]}</span>
            <span className={styles.calendarYearLabel}>{targetYear}</span>
          </div>
          <button type="button" className={styles.calendarNavigationButton}>
            ›
          </button>
        </div>
        <div className={styles.calendarWeekdays}>
          {weekdays.map((day) => (
            <div key={day} className={styles.calendarWeekday}>
              {day}
            </div>
          ))}
        </div>
        <div className={styles.calendarDays}>
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className={styles.calendarDay} />;
            }

            const isToday = isCurrentMonth && day === currentDay;
            const isSelected = false;

            return (
              <button
                key={day}
                type="button"
                className={`${styles.calendarDay} ${isToday ? styles.calendarDayToday : ''} ${isSelected ? styles.calendarDaySelected : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.calendarDesktop} ${types === 'double' ? styles.calendarDouble : ''} ${className || ''}`}
      {...props}
    >
      {renderCalendar(0)}
      {types === 'double' && renderCalendar(1)}
    </div>
  );
};
