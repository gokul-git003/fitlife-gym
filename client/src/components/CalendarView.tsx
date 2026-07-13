import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  events: any[];
  title: string;
  subtitle: string;
  onSelectEvent?: (event: any) => void;
  onSelectSlot?: (slotInfo: any) => void;
}

export default function CalendarView({ events, title, subtitle, onSelectEvent, onSelectSlot }: CalendarViewProps) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">{title}</h1>
        <p className="text-textMuted">{subtitle}</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex-1 min-h-[600px] rounded-xl overflow-hidden shadow-xl"
      >
        <style>
          {`
            .rbc-calendar {
              font-family: inherit;
              color: white;
            }
            .rbc-header {
              padding: 10px;
              font-weight: 600;
              color: #9ca3af;
              border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
              border: 1px solid rgba(255,255,255,0.1) !important;
              border-radius: 8px;
              background: rgba(0,0,0,0.2);
            }
            .rbc-day-bg {
              border-left: 1px solid rgba(255,255,255,0.05) !important;
            }
            .rbc-month-row {
              border-top: 1px solid rgba(255,255,255,0.05) !important;
            }
            .rbc-today {
              background-color: rgba(255,255,255,0.05) !important;
            }
            .rbc-event {
              background-color: #3b82f6 !important;
              border-radius: 6px;
              padding: 2px 6px;
              border: none;
              opacity: 0.9;
            }
            .rbc-event:hover {
              opacity: 1;
            }
            .rbc-event-content {
              font-size: 0.875rem;
              font-weight: 500;
            }
            .rbc-off-range-bg {
              background-color: rgba(0,0,0,0.4) !important;
            }
            .rbc-btn-group button {
              color: #e5e7eb !important;
              background-color: rgba(255,255,255,0.05) !important;
              border: 1px solid rgba(255,255,255,0.1) !important;
              transition: all 0.2s;
            }
            .rbc-btn-group button:hover {
              background-color: rgba(255,255,255,0.1) !important;
            }
            .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
              background-color: #3b82f6 !important;
              color: white !important;
              border-color: #3b82f6 !important;
            }
            .rbc-toolbar-label {
              font-weight: 700;
              font-size: 1.25rem;
              color: white;
            }
            .rbc-time-header-content {
              border-left: 1px solid rgba(255,255,255,0.1) !important;
            }
            .rbc-time-content {
              border-top: 1px solid rgba(255,255,255,0.1) !important;
            }
            .rbc-timeslot-group {
              border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            }
            .rbc-time-view .rbc-day-slot .rbc-time-slot {
              border-top: 1px solid rgba(255,255,255,0.02) !important;
            }
            .rbc-time-header.rbc-overflowing {
              border-right: 1px solid rgba(255,255,255,0.1) !important;
            }
          `}
        </style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '600px' }}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable={!!onSelectSlot}
          views={['month', 'week', 'day']}
        />
      </motion.div>
    </div>
  );
}
