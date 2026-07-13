import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function TrainerDashboard() {
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [workoutForm, setWorkoutForm] = useState({ member_id: '', title: '', details: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch classes
    fetch('/api/member/classes')
      .then(res => res.json())
      .then(data => setTodayClasses(data))
      .catch(console.error);

    // Fetch members for dropdown
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        if (data.length > 0) setWorkoutForm(prev => ({ ...prev, member_id: data[0].id }));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) return;

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workoutForm, trainer_id: user.profileId })
      });
      if (res.ok) {
        setMsg('Workout assigned successfully!');
        setWorkoutForm(prev => ({ ...prev, title: '', details: '' }));
        setTimeout(() => setMsg(''), 3000);
      } else {
        const data = await res.json();
        setMsg(data.error || 'Failed to assign');
      }
    } catch (err) {
      console.error(err);
      setMsg('Network error');
    }
  };

  const handleStart = (_classId: string) => {
    setMsg('Class started successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <Layout role="trainer">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Trainer Portal</h1>
          <p className="text-textMuted">Manage your classes and member workouts.</p>
        </div>
        {msg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-success/20 text-success border border-success/30 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Calendar className="text-primary" /> Today's Schedule
            </h3>
            <button onClick={() => navigate('/trainer/classes')} className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition">View All</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-textMuted">Loading schedule...</p>
            ) : todayClasses.length === 0 ? (
              <p className="text-textMuted">No classes scheduled today.</p>
            ) : (
              todayClasses.map((cls: any) => (
                <div key={cls.id} className="p-4 rounded-xl bg-surface/50 border border-white/5 hover:border-primary/30 transition-colors flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {new Date(cls.schedule_time).getHours()}h
                    </div>
                    <div>
                      <h4 className="text-white font-medium group-hover:text-primary transition-colors">{cls.name}</h4>
                      <p className="text-textMuted text-sm">Capacity: {cls.capacity}</p>
                    </div>
                  </div>
                  <button onClick={() => handleStart(cls.id)} className="text-primary hover:text-white transition px-4 py-1.5 border border-primary hover:bg-primary rounded-lg text-sm font-bold">Start</button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Activity className="text-accent" /> Assign Workout
            </h3>
          </div>
          
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm text-textMuted mb-2">Select Member</label>
              <select 
                value={workoutForm.member_id} 
                onChange={(e) => setWorkoutForm({...workoutForm, member_id: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                required
              >
                {members.map((m: any) => (
                  <option key={m.id} value={m.memberProfile?.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Workout Title</label>
              <input 
                type="text" 
                value={workoutForm.title}
                onChange={(e) => setWorkoutForm({...workoutForm, title: e.target.value})}
                required
                placeholder="e.g. Upper Body Power" 
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Details</label>
              <textarea 
                rows={3} 
                value={workoutForm.details}
                onChange={(e) => setWorkoutForm({...workoutForm, details: e.target.value})}
                required
                placeholder="Exercises, sets, reps..." 
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
              ></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-bold uppercase tracking-wide hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
              Assign Plan
            </button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
