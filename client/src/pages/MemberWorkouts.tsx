import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Check } from 'lucide-react';
import Layout from '../components/Layout';

export default function MemberWorkouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.profileId) {
      try {
        const res = await fetch(`/api/workouts/${user.profileId}`);
        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleCompleteExercise = async (workoutId: string, exerciseId: string) => {
    try {
      await fetch('/api/workouts/exercise/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exerciseId })
      });
      // Refresh to get updated progress
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateProgress = (workout: any) => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    const completed = workout.exercises.filter((ex: any) => ex.completed === 1).length;
    return Math.round((completed / workout.exercises.length) * 100);
  };

  return (
    <Layout role="member">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Workouts</h1>
        <p className="text-textMuted">Track your progress and smash your goals.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-textMuted">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-textMuted">You have no assigned workouts yet.</p>
          </div>
        ) : (
          workouts.map(w => {
            const progress = calculateProgress(w);
            return (
              <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{w.title}</h3>
                    <p className="text-sm text-textMuted">{w.details}</p>
                    <p className="text-xs text-primary mt-2">Assigned by: {w.trainer_name}</p>
                  </div>
                  
                  {/* Progress Circle or Bar */}
                  <div className="w-full md:w-48">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white font-bold">Progress</span>
                      <span className="text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent" 
                      />
                    </div>
                  </div>
                </div>

                {w.exercises && w.exercises.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Exercises</h4>
                    {w.exercises.map((ex: any) => (
                      <div key={ex.id} className="flex justify-between items-center p-4 bg-surface/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ex.completed ? 'bg-success/20 text-success' : 'bg-white/5 text-textMuted'}`}>
                            {ex.completed ? <CheckCircle2 className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className={`font-medium ${ex.completed ? 'text-textMuted line-through' : 'text-white'}`}>{ex.name}</p>
                            <p className="text-xs text-textMuted">{ex.sets} Sets × {ex.reps} Reps</p>
                          </div>
                        </div>
                        {!ex.completed && (
                          <button 
                            onClick={() => handleCompleteExercise(w.id, ex.id)}
                            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Complete
                          </button>
                        )}
                        {ex.completed === 1 && (
                          <span className="text-xs font-bold text-success uppercase tracking-wider px-3">Done</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
