import { useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  isSameDay,
  startOfMonth,
  endOfMonth
} from 'date-fns';

import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  // We can sprinkle in some fun musical icons from lucide-react too:
  Music2,
  Music4
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import MonthView from './MonthView';

type ScheduleType = {
  [key: string]: {
    type: 'JAM' | 'PRIVATE';
    times: string[];
    maxCapacity?: number;
    price: number;
    currentCapacity?: { [key: string]: number };
    zoomClasses?: { [key: string]: string };
  };
};

const SCHEDULE: ScheduleType = {
  MONDAY: {
    type: 'JAM',
    times: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    maxCapacity: 25,
    currentCapacity: {},
    price: 25,
    zoomClasses: {
      '9:00 AM': 'Old-Time Fiddle Groove',
      '10:00 AM': 'Twin Fiddles',
      '11:00 AM': 'Swing Time',
      '12:00 PM': 'Contemporary Tunes',
      '1:00 PM': 'Bluegrass Fiddles & Soloing'
    }
  },
  TUESDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95
  },
  WEDNESDAY: {
    type: 'PRIVATE',
    times: ['7:30 AM', '8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM'],
    price: 95
  },
  THURSDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95
  },
  FRIDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95
  }
};

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [recurringWeeks, setRecurringWeeks] = useState<number>(4);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getDaysInWeek = (startDate: Date) => {
    const days = [];
    let currentDate = startOfWeek(startDate, { weekStartsOn: 1 });
    for (let i = 0; i < 5; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  };

  const weekDays = getDaysInWeek(currentWeek);

  const getAvailableSlots = (date: Date) => {
    const dayName = format(date, 'EEEE').toUpperCase();
    return SCHEDULE[dayName] || { times: [], type: 'PRIVATE', price: 0 };
  };

  const getAvailableDatesInMonth = () => {
    const monthStart = startOfMonth(currentWeek);
    const monthEnd = endOfMonth(currentWeek);
    const availableDates: Date[] = [];
    let current = monthStart;

    while (current <= monthEnd) {
      const dayName = format(current, 'EEEE').toUpperCase();
      if (SCHEDULE[dayName]) {
        availableDates.push(current);
      }
      current = addDays(current, 1);
    }

    return availableDates;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = () => {
    const bookingDates = [];
    if (isRecurring) {
      let currentDate = selectedDate!;
      for (let i = 0; i < recurringWeeks; i++) {
        bookingDates.push({
          date: format(currentDate, 'EEEE, MMMM d, yyyy'),
          time: selectedTime
        });
        currentDate = addWeeks(
          currentDate,
          recurringFrequency === 'weekly' ? 1 : 2
        );
      }
    } else {
      bookingDates.push({
        date: format(selectedDate!, 'EEEE, MMMM d, yyyy'),
        time: selectedTime
      });
    }

    console.log('Booking submitted:', bookingDates);

    setShowBookingForm(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSelectedTime(null);
      setSelectedDate(null);
      setIsRecurring(false);
    }, 3000);
  };

  return (
    // 1) Large container with a pastel gradient background & relative positioning for floaty icons
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 text-slate-700 overflow-hidden p-4 sm:p-6 md:p-8">

      {/* 2) Floaty icons in background (just examples) */}
      <div className="absolute top-8 left-8 animate-bounce">
        <Music2 className="w-12 h-12 text-pink-300 opacity-70" />
      </div>
      <div className="absolute bottom-16 right-10 animate-pulse">
        <Music4 className="w-14 h-14 text-purple-300 opacity-60" />
      </div>

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-xl">
            <p className="font-medium">Lesson booked successfully!</p>
          </div>
        </div>
      )}

      {/* 3) Toggle between Week and Month view */}
      <div className="flex justify-end space-x-4 mb-6">
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-full transition-colors ${
            viewMode === 'week'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}
        >
          Week View
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-full transition-colors ${
            viewMode === 'month'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}
        >
          Month View
        </button>
      </div>

      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentWeek}
          availableDates={getAvailableDatesInMonth()}
          onSelectDate={setSelectedDate}
        />
      ) : (
        <Card className="bg-white/90 rounded-xl shadow-2xl border-0 mb-8">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl text-slate-800">
                  Schedule a Lesson
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-8">
            <div className="grid grid-cols-5 gap-4">
              {weekDays.map((day) => (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`p-5 rounded-xl transition-all bg-white hover:shadow-lg
                    ${
                      selectedDate && isSameDay(day, selectedDate)
                        ? 'border-2 border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-2 border-transparent'
                    }`}
                >
                  <p className="font-semibold text-slate-800 mb-1">
                    {format(day, 'EEEE')}
                  </p>
                  <p className="text-xl text-blue-900">{format(day, 'MMM d')}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && (
        <Card className="bg-white/90 rounded-xl shadow-2xl border-0 mb-8">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-xl text-slate-800">
                Available Times for {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getAvailableSlots(selectedDate).times.map((time) => {
                const daySchedule =
                  SCHEDULE[format(selectedDate, 'EEEE').toUpperCase()];
                const isZoomClass = daySchedule?.zoomClasses?.[time];

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-5 rounded-xl border-2 transition-all bg-white
                      ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {daySchedule?.type === 'JAM' ? (
                        <Users className="w-5 h-5 text-green-600" />
                      ) : isZoomClass ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <CalendarIcon className="w-5 h-5 text-orange-500" />
                      )}
                      <span className="text-lg font-medium text-slate-700">
                        {time}
                      </span>
                    </div>
                    {isZoomClass && (
                      <p className="text-sm text-slate-600 mb-2">{isZoomClass}</p>
                    )}
                    <p className="text-lg font-medium text-slate-700">
                      ${daySchedule?.price}
                    </p>
                    {daySchedule?.type === 'JAM' && (
                      <p className="text-sm text-gray-600 mt-2">
                        {daySchedule.maxCapacity! -
                          (daySchedule.currentCapacity?.[time] || 0)}{' '}
                        spots left
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showBookingForm && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border-0">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-2xl text-slate-800">
                Book Your Lesson
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-8">
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                  <p className="text-lg">
                    <span className="font-medium text-slate-700">Date:</span>{' '}
                    <span className="text-slate-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </p>
                  <p className="text-lg">
                    <span className="font-medium text-slate-700">Time:</span>{' '}
                    <span className="text-slate-900">{selectedTime}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className="text-lg text-slate-700">
                      Make this a recurring booking
                    </span>
                  </label>

                  {isRecurring && (
                    <div className="ml-8 space-y-4">
                      <div>
                        <label className="text-lg text-slate-700 mb-2 block">
                          Frequency:
                        </label>
                        <select
                          value={recurringFrequency}
                          onChange={(e) =>
                            setRecurringFrequency(
                              e.target.value as 'weekly' | 'biweekly'
                            )
                          }
                          className="px-4 py-2 border rounded-lg text-slate-700"
                        >
                          <option value="weekly">Every week</option>
                          <option value="biweekly">Every other week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-lg text-slate-700 mb-2 block">
                          Duration:
                        </label>
                        <select
                          value={recurringWeeks}
                          onChange={(e) =>
                            setRecurringWeeks(Number(e.target.value))
                          }
                          className="px-4 py-2 border rounded-lg text-slate-700"
                        >
                          <option value={4}>4 sessions</option>
                          <option value={8}>8 sessions</option>
                          <option value={12}>12 sessions</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="px-6 py-3 text-slate-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Calendar;