import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock, Calendar, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import { Canvas } from '@react-three/fiber';
import ThreeDModel from '../components/ThreeDModel';

export default function MemberDashboard() {
  const [nextWorkout, setNextWorkout] = useState<any>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInMsg, setCheckInMsg] = useState('');

  const fetchDashboard = () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.profileId) {
      // Fetch workouts
      fetch(`/api/workouts/${user.profileId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setNextWorkout(data[0]); // newest first
          }
        })
        .catch(console.error);

      // Fetch classes
      fetch(`/api/member/classes`)
        .then(res => res.json())
        .then(data => {
          setUpcomingClasses(data.slice(0, 3));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) return;
    
    try {
      const res = await fetch('/api/attendance/member/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ memberId: user.profileId })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckInMsg('Checked in successfully!');
      } else {
        setCheckInMsg(data.error || data.reason || 'Failed to check in');
      }
      setTimeout(() => setCheckInMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) return;
    
    try {
      const res = await fetch('/api/attendance/member/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ memberId: user.profileId })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckInMsg('Checked out successfully!');
      } else {
        setCheckInMsg(data.error || data.reason || 'Failed to check out');
      }
      setTimeout(() => setCheckInMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (class_id: string) => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) return;

    try {
      const res = await fetch('/api/member/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id, member_id: user.profileId }),
      });
      if (res.ok) {
        setCheckInMsg('Class booked!');
        setTimeout(() => setCheckInMsg(''), 3000);
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout role="member">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Member Portal</h1>
          <p className="text-textMuted">Track your progress and book your next session.</p>
        </div>
        {checkInMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-success/20 text-success border border-success/30 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {checkInMsg}
          </motion.div>
        )}
      </div>

      {/* Hero Progress Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ThreeDModel />
            </Canvas>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Keep crushing it!</h2>
            <p className="text-textMuted mb-6">Stay consistent and track your goals dynamically.</p>
            <div className="flex gap-4">
              <button onClick={handleCheckIn} className="px-6 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Check In
              </button>
              <button onClick={handleCheckOut} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-2">
                <Clock className="w-5 h-5" /> Check Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Workout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white">Assigned Workout</h3>
          </div>
          
          {loading ? (
             <p className="text-textMuted">Loading...</p>
          ) : nextWorkout ? (
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{nextWorkout.title}</h4>
                  <p className="text-sm text-textMuted">by {nextWorkout.trainer_name || 'Your Trainer'}</p>
                </div>
                <div 
                  onClick={() => {
                    setCheckInMsg('Workout started! Keep crushing it!');
                    setTimeout(() => setCheckInMsg(''), 3000);
                  }}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <p className="text-sm text-textMuted mb-6">{nextWorkout.details}</p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-textMuted">
                  <Clock className="w-4 h-4 text-primary" /> Today
                </div>
                <div className="flex items-center gap-2 text-sm text-textMuted">
                  <Activity className="w-4 h-4 text-accent" /> Custom Plan
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-surface/50 border border-white/5 rounded-2xl">
               <p className="text-textMuted">No workouts assigned.</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Classes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white">Upcoming Classes</h3>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-textMuted">Loading classes...</p>
            ) : upcomingClasses.length === 0 ? (
              <p className="text-textMuted">No upcoming classes available.</p>
            ) : (
              upcomingClasses.map((cls: any) => {
                return (
                  <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-accent">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{cls.name}</h4>
                        <p className="text-xs text-textMuted">{new Date(cls.schedule_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBook(cls.id)}
                      className="px-4 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all text-sm font-medium">
                      Book
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
