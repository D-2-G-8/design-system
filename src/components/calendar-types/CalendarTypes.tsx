import React from 'react';
import styles from './CalendarTypes.module.css';

export interface CalendarTypesProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'days';
}

export function CalendarTypes({ type, className, ...props }: CalendarTypesProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthDays = prevLastDay.getDate();
    
    const days: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean; isWeekend: boolean; isSelected: boolean }> = [];
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: false,
        isSelected: false
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isSelected: i === 15
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: false,
        isSelected: false
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`${styles.calendar} ${className || ''}`} {...props}>
      <div className={styles.header}>
        <button className={styles.navButton} type="button" aria-label="Previous month">
          ‹
        </button>
        <div className={styles.monthYear}>{monthYear}</div>
        <button className={styles.navButton} type="button" aria-label="Next month">
          ›
        </button>
      </div>
      
      <div className={styles.weekdays}>
        {daysOfWeek.map((day, index) => (
          <div key={index} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>
      
      <div className={styles.days}>
        {calendarDays.map((dayInfo, index) => {
          const dayClasses = [
            styles.day,
            dayInfo.isToday && styles.today,
            dayInfo.isSelected && styles.selected,
            !dayInfo.isCurrentMonth && styles.otherMonth,
            dayInfo.isWeekend && styles.weekend
          ].filter(Boolean).join(' ');
          
          return (
            <button
              key={index}
              type="button"
              className={dayClasses}
              disabled={!dayInfo.isCurrentMonth}
            >
              <span className={styles.dayContent}>{dayInfo.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
