import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User } from 'lucide-react';
import Layout from '../components/Layout';

export default function TrainerWorkouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [memberId, setMemberId] = useState('');
  
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: 10 }]);

  const fetchData = async () => {
    try {
      // Need a way to fetch all workouts for this trainer. Let's just fetch all workouts for now and filter on frontend or add API.
      // We will just fetch all members to assign
      const membersRes = await fetch('/api/admin/members');
      const mData = await membersRes.json();
      setMembers(mData);

      // Actually, since we only have GET /api/workouts/:member_id, we need a new endpoint for GET /api/workouts/trainer/:trainer_id.
      // But we can just build it in server.js next.
      const user = JSON.parse(localStorage.getItem('gymUser') || '{}');
      if (user.profileId) {
        const wRes = await fetch(`/api/workouts/trainer/${user.profileId}`);
        if(wRes.ok) {
           const wData = await wRes.json();
           setWorkouts(wData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10 }]);
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    const newEx = [...exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('gymUser') || '{}');
    if (!user.profileId) return;

    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: user.profileId,
          member_id: memberId,
          title,
          details,
          exercises: exercises.filter(ex => ex.name.trim() !== '')
        })
      });
      setIsModalOpen(false);
      setTitle('');
      setDetails('');
      setExercises([{ name: '', sets: 3, reps: 10 }]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout role="trainer">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Workout Management</h1>
          <p className="text-textMuted">Create and assign detailed workout plans</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workouts.map(w => (
          <div key={w.id} className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-2">{w.title}</h3>
            <div className="flex items-center gap-2 text-sm text-textMuted mb-4">
              <User className="w-4 h-4" /> Assigned to: {members.find(m => m.id == w.member_id)?.name || 'Unknown'}
            </div>
            <p className="text-sm text-textMuted mb-4">{w.details}</p>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Exercises ({w.exercises?.length || 0})</p>
              {w.exercises?.map((ex: any) => (
                <div key={ex.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm">
                  <span className="text-white">{ex.name}</span>
                  <span className="text-textMuted">{ex.sets}x{ex.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {workouts.length === 0 && <p className="text-textMuted">No workout plans assigned yet.</p>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface border border-border p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Create Workout Plan</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Assign to Member</label>
                    <select required value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white">
                      <option value="">Select Member...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.memberProfile?.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Description</label>
                  <textarea required value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white h-24" />
                </div>
                
                <div className="border-t border-border/50 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-white uppercase tracking-wider">Exercises</label>
                    <button type="button" onClick={handleAddExercise} className="text-sm text-primary hover:text-primaryHover flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Exercise
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl">
                        <div className="flex-1">
                          <input type="text" placeholder="Exercise Name" required value={ex.name} onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm" />
                        </div>
                        <div className="w-24">
                          <input type="number" placeholder="Sets" required value={ex.sets} onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm" />
                        </div>
                        <div className="w-24">
                          <input type="number" placeholder="Reps" required value={ex.reps} onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))} className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Assign Workout</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
