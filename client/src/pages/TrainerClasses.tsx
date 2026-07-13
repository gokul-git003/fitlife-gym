import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Activity, CheckCircle2, Edit2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function TrainerClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({ name: '', schedule_time: '', capacity: 20 });

  const fetchClasses = () => {
    const user = JSON.parse(localStorage.getItem('gymUser') || '{}');
    fetch(`/api/trainer/classes?trainerId=${user.profileId}`)
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

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('gymUser') || '{}');
    try {
      if (editClassId) {
        await fetch(`/api/trainer/classes/${editClassId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClass)
        });
        setMsg('Class updated successfully!');
      } else {
        await fetch('/api/member/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newClass, trainer_id: user.profileId })
        });
        setMsg('Class scheduled successfully!');
      }
      setShowScheduleModal(false);
      setEditClassId(null);
      setNewClass({ name: '', schedule_time: '', capacity: 20 });
      fetchClasses();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = (_classId: string) => {
    setMsg('Class started successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const openEditModal = (cls: any) => {
    setEditClassId(cls.id);
    // Convert ISO string to datetime-local format (YYYY-MM-DDThh:mm)
    const localDate = new Date(cls.schedule_time);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    const formattedDate = localDate.toISOString().slice(0, 16);
    
    setNewClass({
      name: cls.name,
      schedule_time: formattedDate,
      capacity: cls.capacity
    });
    setShowScheduleModal(true);
  };

  return (
    <Layout role="trainer">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">My Classes</h1>
          <p className="text-textMuted">Manage your class schedule and attendees.</p>
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
        <button onClick={() => {
          setEditClassId(null);
          setNewClass({ name: '', schedule_time: '', capacity: 20 });
          setShowScheduleModal(true);
        }} className="px-6 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Schedule Class
        </button>
      </div>

      {/* Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">{editClassId ? 'Edit Class' : 'Schedule Class'}</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-2">Class Name</label>
                <input type="text" required value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-2">Date & Time</label>
                <input type="datetime-local" required value={newClass.schedule_time} onChange={e => setNewClass({...newClass, schedule_time: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-2">Capacity</label>
                <input type="number" required value={newClass.capacity} onChange={e => setNewClass({...newClass, capacity: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-accent text-white rounded-xl font-bold">
                  {editClassId ? 'Save Changes' : 'Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Calendar className="w-16 h-16 text-textMuted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Classes Scheduled</h2>
          <p className="text-textMuted max-w-md mx-auto">You don't have any upcoming classes. Click "Schedule Class" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={cls.id} 
              className="glass-card overflow-hidden group hover:border-accent/50 transition-colors"
            >
              <div className="h-32 bg-surface/80 relative flex items-center justify-center">
                <Activity className="w-12 h-12 text-accent/50 group-hover:scale-110 transition-transform" />
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                  Capacity: {cls.capacity}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-white mb-4">{cls.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-textMuted">
                    <Clock className="w-4 h-4 mr-3 text-accent" />
                    {new Date(cls.schedule_time).toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm text-textMuted">
                    <Users className="w-4 h-4 mr-3 text-success" />
                    {cls.bookings?.length || 0} / {cls.capacity} Enrolled
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleStart(cls.id)} className="flex-1 py-2.5 bg-accent/20 hover:bg-accent text-accent hover:text-white border border-accent/50 rounded-lg font-bold transition-all text-sm">
                    Start Class
                  </button>
                  <button onClick={() => openEditModal(cls)} className="p-2.5 bg-surface hover:bg-white/10 text-textMuted hover:text-white border border-border rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
