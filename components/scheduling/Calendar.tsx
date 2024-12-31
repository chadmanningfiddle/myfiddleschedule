'use client';

import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Playfair_Display } from 'next/font/google';
import MonthView from './MonthView'; // Either ensure you have MonthView or remove if not needed

////////////////////////////////////////////////////////////////////////////////
// 1) STYLING CONSTANTS
////////////////////////////////////////////////////////////////////////////////

const playfair = Playfair_Display({ subsets: ['latin'] });

const BG_COLOR = 'bg-[#fdf8f3]'; // Warm neutral background
const ACCENT_COLOR = 'text-[#2c5f85]';
const ACCENT_BG_HOVER = 'hover:bg-[#f2f2f2]';
const BIG_TEXT = 'text-xl';
const BIGGER_TEXT = 'text-2xl';

////////////////////////////////////////////////////////////////////////////////
// 2) CLASS IMAGES (TYPED AS A RECORD)
////////////////////////////////////////////////////////////////////////////////

type ClassInfo = {
  image: string;
  alt: string;
  description: string;
};

const CLASS_IMAGES: Record<string, ClassInfo> = {
  'Old-Time Fiddle Groove': {
    image: '/api/placeholder/400/300',
    alt: 'Old-Time Fiddle Groove Class',
    description: 'Traditional clawhammer and old-time fiddle techniques',
  },
  'Twin Fiddles': {
    image: '/api/placeholder/400/300',
    alt: 'Twin Fiddles Class',
    description: 'Harmonies and dual fiddle arrangements',
  },
  'Swing Time': {
    image: '/api/placeholder/400/300',
    alt: 'Swing Time Class',
    description: 'Jazz and swing fiddle techniques',
  },
  'Contemporary Tunes': {
    image: '/api/placeholder/400/300',
    alt: 'Contemporary Tunes Class',
    description: 'Modern fiddle arrangements and techniques',
  },
  'Bluegrass Fiddles & Soloing': {
    image: '/api/placeholder/400/300',
    alt: 'Bluegrass Fiddles Class',
    description: 'Traditional bluegrass techniques and improvisation',
  },
};

////////////////////////////////////////////////////////////////////////////////
// 3) SCHEDULE DEFINITION
////////////////////////////////////////////////////////////////////////////////

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

// Monday = JAM with a base price of $20, after 4 total Monday bookings, it’s $25
const SCHEDULE: ScheduleType = {
  MONDAY: {
    type: 'JAM',
    times: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    maxCapacity: 25,
    currentCapacity: {},
    price: 20,
    zoomClasses: {
      '9:00 AM': 'Old-Time Fiddle Groove',
      '10:00 AM': 'Twin Fiddles',
      '11:00 AM': 'Swing Time',
      '12:00 PM': 'Contemporary Tunes',
      '1:00 PM': 'Bluegrass Fiddles & Soloing',
    },
  },
  TUESDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95,
  },
  WEDNESDAY: {
    type: 'PRIVATE',
    times: ['7:30 AM', '8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM'],
    price: 95,
  },
  THURSDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95,
  },
  FRIDAY: {
    type: 'PRIVATE',
    times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'],
    price: 95,
  },
};

////////////////////////////////////////////////////////////////////////////////
// 4) CALENDAR COMPONENT
////////////////////////////////////////////////////////////////////////////////

const Calendar: React.FC = () => {
  // Use function form so "new Date()" is only run once
  const [currentWeek, setCurrentWeek] = useState(() => new Date());

  // Selected slot
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Modals & success
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Recurring booking
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [recurringWeeks, setRecurringWeeks] = useState<number>(4);

  // Toggle week/month
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Monday Lesson Count
  const [mondayLessonCount, setMondayLessonCount] = useState(0);

  //////////////////////////////////////////////////////////////////////////
  // Helpers
  //////////////////////////////////////////////////////////////////////////

  /**
   * Returns an array of Monday–Friday dates for the specified start date.
   */
  const getDaysInWeek = (startDate: Date) => {
    const days = [];
    let currentDate = startOfWeek(startDate, { weekStartsOn: 1 });
    for (let i = 0; i < 5; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  };
  const weekDays = getDaysInWeek(currentWeek);

  /**
   * Returns the schedule (times, price, zoomClasses, etc.) for a given date
   */
  const getAvailableSlots = (date: Date) => {
    const dayName = format(date, 'EEEE').toUpperCase();
    return SCHEDULE[dayName] || { times: [], type: 'PRIVATE', price: 0 };
  };

  /**
   * Returns an array of valid dates in the same month as currentWeek (for MonthView)
   */
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

  /**
   * Returns the price for a given date (if Monday jam, it’s $20 for first 4, $25 after that)
   */
  const getSlotPrice = (date: Date) => {
    const dayName = format(date, 'EEEE').toUpperCase();
    const daySchedule = SCHEDULE[dayName];
    if (!daySchedule) return 0;

    // Monday jam logic
    if (dayName === 'MONDAY' && daySchedule.type === 'JAM') {
      return mondayLessonCount < 4 ? 20 : 25;
    }
    return daySchedule.price;
  };

  //////////////////////////////////////////////////////////////////////////
  // Handlers
  //////////////////////////////////////////////////////////////////////////

  // Called when user clicks on a time slot
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };

  // Called when user confirms booking
  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    const bookingDates: {
      date: string;
      time: string;
      price: number;
    }[] = [];

    let localMondayCount = mondayLessonCount;

    if (isRecurring) {
      // Generate multiple weeks out
      let currentDate = selectedDate;
      for (let i = 0; i < recurringWeeks; i++) {
        const dayName = format(currentDate, 'EEEE').toUpperCase();
        const daySchedule = SCHEDULE[dayName];
        let price = 0;

        if (daySchedule?.type === 'JAM' && dayName === 'MONDAY') {
          price = localMondayCount < 4 ? 20 : 25;
          localMondayCount++;
        } else {
          price = daySchedule?.price || 0;
        }

        bookingDates.push({
          date: format(currentDate, 'EEEE, MMMM d, yyyy'),
          time: selectedTime,
          price,
        });

        currentDate = addWeeks(
          currentDate,
          recurringFrequency === 'weekly' ? 1 : 2
        );
      }
    } else {
      // Single booking
      const dayName = format(selectedDate, 'EEEE').toUpperCase();
      const daySchedule = SCHEDULE[dayName];
      let price = daySchedule?.price || 0;

      if (daySchedule?.type === 'JAM' && dayName === 'MONDAY') {
        price = localMondayCount < 4 ? 20 : 25;
        localMondayCount++;
      }

      bookingDates.push({
        date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        time: selectedTime,
        price,
      });
    }

    console.log('Booking submitted:', bookingDates);

    // Update global Monday count
    setMondayLessonCount(localMondayCount);

    // Reset states / show success
    setShowBookingForm(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSelectedTime(null);
      setSelectedDate(null);
      setIsRecurring(false);
    }, 3000);
  };

  //////////////////////////////////////////////////////////////////////////
  // Render
  //////////////////////////////////////////////////////////////////////////

  return (
    <div className={`${playfair.className} ${BG_COLOR} min-h-screen p-6`}>
      {/* Success popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-lg">
            <p className="font-medium">Lesson booked successfully!</p>
          </div>
        </div>
      )}

      {/* Toggle view */}
      <div className="flex justify-end space-x-4 mb-6">
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg border border-transparent
            ${
              viewMode === 'week'
                ? 'bg-[#2c5f85] text-white'
                : `${ACCENT_COLOR} ${ACCENT_BG_HOVER}`
            }`}
          style={{ minWidth: '120px' }}
        >
          Week View
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg border border-transparent
            ${
              viewMode === 'month'
                ? 'bg-[#2c5f85] text-white'
                : `${ACCENT_COLOR} ${ACCENT_BG_HOVER}`
            }`}
          style={{ minWidth: '120px' }}
        >
          Month View
        </button>
      </div>

      {/* Calendar content */}
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentWeek}
          availableDates={getAvailableDatesInMonth()}
          onSelectDate={setSelectedDate}
        />
      ) : (
        <Card className="shadow-xl border border-gray-200">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className={`w-6 h-6 ${ACCENT_COLOR}`} />
                <CardTitle className={`${BIGGER_TEXT} text-gray-900`}>
                  Schedule a Lesson
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                  className={`p-2 rounded-lg ${ACCENT_COLOR} ${ACCENT_BG_HOVER}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className={`p-2 rounded-lg ${ACCENT_COLOR} ${ACCENT_BG_HOVER}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-6">
            <div className="grid grid-cols-5 gap-4">
              {weekDays.map((day) => (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`p-6 rounded-lg transition-all text-left
                    ${
                      selectedDate && isSameDay(day, selectedDate)
                        ? 'bg-[#e9f3fb] border-2 border-[#2c5f85] shadow-sm'
                        : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                >
                  <p className="font-medium text-gray-900 mb-1">
                    {format(day, 'EEEE')}
                  </p>
                  <p className="text-xl text-blue-900">{format(day, 'MMM d')}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* If a date is selected, show times */}
      {selectedDate && (
        <Card className="shadow-xl border border-gray-200 mt-6">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-6 h-6 ${ACCENT_COLOR}`} />
              <CardTitle className={`${BIG_TEXT} text-gray-900`}>
                Available Times for {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getAvailableSlots(selectedDate).times.map((time) => {
                const dayName = format(selectedDate, 'EEEE').toUpperCase();
                const daySchedule = SCHEDULE[dayName];

                // Make sure it's always a string
                const isZoomClass = daySchedule?.zoomClasses?.[time] ?? "";

                // Grab the relevant image or null if key not found
                const classImage = CLASS_IMAGES[isZoomClass] ?? null;

                // Price logic
                const slotPrice = getSlotPrice(selectedDate);

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-6 rounded-lg border-2 transition-all text-left
                      ${
                        selectedTime === time
                          ? 'border-[#2c5f85] bg-[#e9f3fb] shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    {/* Time + Icon */}
                    <div className="flex items-center gap-2 mb-2">
                      {daySchedule?.type === 'JAM' ? (
                        <Users className="w-5 h-5 text-green-600" />
                      ) : isZoomClass ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <CalendarIcon className="w-5 h-5 text-orange-500" />
                      )}
                      <span className="text-lg font-medium">{time}</span>
                    </div>

                    {/* Zoom class info */}
                    {isZoomClass && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-700 font-semibold">
                          {isZoomClass}
                        </p>
                        {classImage && (
                          <>
                            <img
                              src={classImage.image}
                              alt={classImage.alt}
                              className="w-full h-auto mt-2 rounded-md"
                            />
                            <p className="text-sm text-gray-600 mt-2">
                              {classImage.description}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <p className="text-lg font-medium">${slotPrice}</p>

                    {/* Spots left for JAM */}
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

      {/* Booking Modal */}
      {showBookingForm && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl shadow-2xl border border-gray-200">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <CardTitle className={`${BIGGER_TEXT} text-gray-900`}>
                Book Your Lesson
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="space-y-6">
                <div className="bg-[#eee8df] rounded-lg p-6 space-y-3">
                  <p className="text-lg">
                    <span className="font-medium text-gray-700">Date:</span>{' '}
                    <span className="text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </p>
                  <p className="text-lg">
                    <span className="font-medium text-gray-700">Time:</span>{' '}
                    <span className="text-gray-900">{selectedTime}</span>
                  </p>
                </div>

                {/* Recurring Booking */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-lg">Make this a recurring booking</span>
                  </label>
                  {isRecurring && (
                    <div className="ml-8 space-y-4">
                      <div>
                        <label className="text-lg mb-2 block">Frequency:</label>
                        <select
                          value={recurringFrequency}
                          onChange={(e) =>
                            setRecurringFrequency(
                              e.target.value as 'weekly' | 'biweekly'
                            )
                          }
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="weekly">Every week</option>
                          <option value="biweekly">Every other week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-lg mb-2 block">Duration:</label>
                        <select
                          value={recurringWeeks}
                          onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value={4}>4 sessions</option>
                          <option value={8}>8 sessions</option>
                          <option value={12}>12 sessions</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    className={`px-4 py-2 rounded-lg ${ACCENT_COLOR}
                      bg-[#e0f2fc] hover:bg-[#d0eaf5] transition-colors`}
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