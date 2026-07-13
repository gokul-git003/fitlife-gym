import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CalendarView from '../components/CalendarView';
import { parseISO, addMinutes } from 'date-fns';

export default function TrainerCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // In a real app we'd fetch actual classes. For now, we mock if no data.
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    
    fetch(`/api/trainer/${user?.id}/calendar`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            title: `${item.name} (${item.capacity} capacity)`,
            start: parseISO(item.startTime),
            end: addMinutes(parseISO(item.startTime), 60), // Assuming 60 mins duration
          }));
          setEvents(formatted);
        } else {
          // Dummy data for trainer
          const today = new Date();
          setEvents([
            {
              id: 1,
              title: 'My Morning Class',
              start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
              end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
            },
            {
              id: 2,
              title: 'Personal Training Session',
              start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
              end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
            }
          ]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Layout role="trainer">
      <CalendarView 
        title="My Schedule" 
        subtitle="Manage your classes and personal training sessions."
        events={events}
        onSelectEvent={(e) => alert(`Session: ${e.title}`)}
      />
    </Layout>
  );
}
