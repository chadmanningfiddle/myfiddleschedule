import React from 'react';
import Calendar from '../components/scheduling/Calendar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
      <header className="bg-blue-950 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-2">MyFiddleSchedule</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Calendar />
      </main>
    </div>
  );
}