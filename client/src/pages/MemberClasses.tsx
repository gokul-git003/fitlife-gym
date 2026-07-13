import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function MemberClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingMsg, setBookingMsg] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = () => {
    setLoading(true);
    fetch('/api/member/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleBook = async (classId: string) => {
    // We would ideally have JWT token attached, but using mock headers or standard fetch here
    // Currently, since auth might not be fully persisted with cookies, we can pass memberId via a dummy payload or session.
    // Assuming backend gets memberId from session or we pass a hardcoded one for this prototype.
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      setBookingMsg('You must be logged in to book');
      return;
    }

    try {
      const res = await fetch('/api/member/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: classId, memberId: user.profileId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingMsg(data.status === 'waitlist' ? 'Added to waitlist!' : 'Successfully booked!');
        fetchClasses(); // refresh to show updated capacity
        setTimeout(() => setBookingMsg(''), 3000);
      } else {
        const data = await res.json();
        setBookingMsg(data.error || 'Booking failed');
      }
    } catch {
      setBookingMsg('Network error');
    }
  };

  const handleCancel = async (bookingId: string) => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;
    
    try {
      const res = await fetch('/api/member/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (res.ok) {
        setBookingMsg('Booking cancelled.');
        fetchClasses();
        setTimeout(() => setBookingMsg(''), 3000);
      }
    } catch {
      setBookingMsg('Network error');
    }
  };

  return (
    <Layout role="member">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Available Classes</h1>
        <p className="text-textMuted">Book your next session with our elite trainers.</p>
      </div>

      {bookingMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary/20 border border-primary/50 text-white rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 text-primary" />
          {bookingMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-textMuted col-span-full">Loading classes...</p>
        ) : classes.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-textMuted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No classes available</h3>
            <p className="text-textMuted">Check back later for new schedules.</p>
          </div>
        ) : (
          classes.map((cls, idx) => {
            const userStr = localStorage.getItem('gymUser');
            const user = userStr ? JSON.parse(userStr) : null;
            const booking = cls.bookings?.find((b: any) => b.memberId === user?.profileId && (b.status === 'booked' || b.status === 'waitlist'));
            const hasBooked = !!booking;
            const bookedCount = cls.bookings?.filter((b: any) => b.status === 'booked').length || 0;
            const spotsLeft = cls.capacity - bookedCount;
            const isFull = spotsLeft <= 0;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={cls.id}
                className="glass-card p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-xl text-white mb-1">{cls.name}</h3>
                  <p className="text-sm text-primary font-medium mb-4">by {cls.trainer_name || 'Trainer'}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-textMuted">
                      <Clock className="w-4 h-4 mr-3 text-accent" />
                      {new Date(cls.schedule_time).toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-textMuted">
                      <CheckCircle2 className="w-4 h-4 mr-3 text-success" />
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Class Full'}
                    </div>
                  </div>
                  
                  {hasBooked ? (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="w-full py-3 bg-white/10 hover:bg-danger/20 text-white hover:text-danger rounded-xl font-bold uppercase tracking-wide transition-all border border-transparent hover:border-danger/30"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBook(cls.id)}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all text-white shadow-lg
                        ${isFull ? 'bg-accent/80 hover:bg-accent shadow-accent/30' : 'bg-gradient-to-r from-primary to-accent hover:from-primaryHover hover:to-accent/80 shadow-primary/30'}
                      `}
                    >
                      {isFull ? 'Join Waitlist' : 'Book Now'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
