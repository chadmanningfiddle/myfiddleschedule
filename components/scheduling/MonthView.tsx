import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type MonthViewProps = {
  currentDate: Date;
  availableDates: Date[];
  onSelectDate: (date: Date) => void;
};

const MonthView: React.FC<MonthViewProps> = ({ currentDate, availableDates, onSelectDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month start */}
          {[...Array(monthStart.getDay())].map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map(date => {
            const hasAvailability = availableDates.some(d => 
              format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            
            return (
              <button
                key={date.toString()}
                onClick={() => onSelectDate(date)}
                disabled={!hasAvailability || !isSameMonth(date, currentDate)}
                className={`h-12 rounded-lg flex items-center justify-center relative
                  ${hasAvailability ? 'hover:bg-blue-50' : 'text-gray-400'}
                  ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}
                `}
              >
                <span className="text-sm">{format(date, 'd')}</span>
                {hasAvailability && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthView;