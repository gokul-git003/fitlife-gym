import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CalendarView from '../components/CalendarView';
import { parseISO, addMinutes } from 'date-fns';

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // In a real app we'd fetch actual classes. For now, we mock if no data.
    // Let's assume we have an endpoint that returns all classes for the calendar.
    fetch('/api/admin/calendar')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            title: item.type === 'workout' 
              ? `Workout: ${item.name} (${item.member?.name || 'Member'})`
              : `Class: ${item.name} (${item.trainer?.name || 'Trainer'})`,
            start: parseISO(item.startTime),
            end: addMinutes(parseISO(item.startTime), 60), // Assuming 60 mins duration
          }));
          setEvents(formatted);
        } else {
          // Dummy data
          const today = new Date();
          setEvents([
            {
              id: 1,
              title: 'Yoga Class (Sarah)',
              start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
              end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
            },
            {
              id: 2,
              title: 'HIIT Training (Mike)',
              start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
              end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
            }
          ]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Layout role="admin">
      <CalendarView 
        title="Master Calendar" 
        subtitle="Overview of all gym classes and trainer schedules."
        events={events}
        onSelectEvent={(e) => alert(`Class: ${e.title}`)}
      />
    </Layout>
  );
}
