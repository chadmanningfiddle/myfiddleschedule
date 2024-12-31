'use client'; 
// (If you get an error about 'use client', remove it if you’re on Next 12)

import React, { useState } from 'react';
import { format } from 'date-fns';

// A single selection object
type ClassSelection = {
  date: Date;   // the date of the lesson
  time: string; // the time slot
};

export default function MondayClassesPage() {
  // A list of Monday times. Feel free to add or remove.
  const mondayTimes = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
  ];

  // We'll store multiple chosen classes in an array
  const [selectedClasses, setSelectedClasses] = useState<ClassSelection[]>([]);

  // Hardcode a Monday date (like January 8, 2024) just for demonstration.
  // You can change this to a dynamic date or multiple Monday dates if you want.
  const mondayDate = new Date(2024, 0, 8); // Month is 0-based, so 0 = January

  /**
   * toggleSelection: add or remove a time slot from selectedClasses
   */
  const toggleSelection = (date: Date, time: string) => {
    // Check if it's already in the array
    const exists = selectedClasses.find(
      (sc) => sc.date.getTime() === date.getTime() && sc.time === time
    );
    if (exists) {
      // Remove it
      setSelectedClasses(selectedClasses.filter((sc) => sc !== exists));
    } else {
      // Add it
      setSelectedClasses([...selectedClasses, { date, time }]);
    }
  };

  // Count how many Monday classes are selected
  const mondayCount = selectedClasses.filter((sc) => {
    const dayName = format(sc.date, 'EEEE').toUpperCase();
    return dayName === 'MONDAY';
  }).length;

  // If 4+ Monday classes are selected, they cost $20 each; otherwise $25
  const getMondayPrice = () => (mondayCount >= 4 ? 20 : 25);

  // Calculate total cost
  let totalCost = 0;
  selectedClasses.forEach((sc) => {
    const dayName = format(sc.date, 'EEEE').toUpperCase();
    if (dayName === 'MONDAY') {
      totalCost += getMondayPrice();
    } else {
      // If you had other day logic, you'd handle it here, but for now, it's just Monday.
      totalCost += 25;
    }
  });

  return (
    <div className="flex bg-[#fffaf3] min-h-screen p-4 gap-4">
      {/* MAIN CONTENT: Monday classes */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Monday Classes</h1>
        <div className="grid grid-cols-3 gap-4">
          {mondayTimes.map((time) => {
            // Check if this time is already selected
            const isSelected = selectedClasses.some(
              (sc) => sc.date.getTime() === mondayDate.getTime() && sc.time === time
            );

            return (
              <button
                key={time}
                onClick={() => toggleSelection(mondayDate, time)}
                className={`p-6 rounded-lg text-xl font-semibold border transition-all
                  ${
                    isSelected
                      ? "border-4 border-blue-600 bg-blue-50 shadow-lg"
                      : "border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* SIDE CART */}
      <div className="w-80 bg-white p-4 rounded-lg shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        
        {/* List of selected classes */}
        <ul className="space-y-3 flex-1 overflow-auto mb-4">
          {selectedClasses.map((sc, index) => {
            // Monday classes cost dynamic price
            const price = getMondayPrice();
            return (
              <li key={index} className="flex justify-between">
                <span className="text-lg">
                  {format(sc.date, 'EEE MMM d')} @ {sc.time}
                </span>
                <span className="text-lg font-bold">${price}</span>
              </li>
            );
          })}
        </ul>

        <hr className="mb-4"/>

        {/* Total */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-xl font-bold">${totalCost}</span>
        </div>

        {/* Payment Info */}
        <div className="border p-3 rounded-md bg-[#f9f9f9]">
          <p className="text-md font-semibold mb-2">Payment Methods:</p>
          <p className="text-md mb-1">Zelle: chad.manning@gmail.com</p>
          <p className="text-md">Venmo: Chad-Manning-18</p>
        </div>
      </div>
    </div>
  );
}