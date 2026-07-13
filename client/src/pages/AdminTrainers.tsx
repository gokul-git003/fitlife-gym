import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [msg, setMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    specialty: ''
  });

  const fetchTrainers = () => {
    fetch('/api/admin/trainers')
      .then(res => res.json())
      .then(data => {
        setTrainers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ username: '', password: '', name: '', specialty: '' });
    setShowAddModal(true);
  };

  const openEditModal = (trainer: any) => {
    setIsEditMode(true);
    setEditingId(trainer.id);
    setFormData({ 
      username: trainer.username || '', 
      password: '', // blank for edit
      name: trainer.name || '', 
      specialty: trainer.trainerProfile?.specialty || '' 
    });
    setShowAddModal(true);
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = '/api/admin/trainers';
      let method = 'POST';
      let body = { ...formData };
      
      if (isEditMode) {
        url = `/api/admin/trainers/${editingId}`;
        method = 'PUT';
        // dont send empty password on edit
        if (!body.password) delete (body as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setMsg(`Trainer ${isEditMode ? 'updated' : 'added'} successfully!`);
        setShowAddModal(false);
        setFormData({ username: '', password: '', name: '', specialty: '' });
        fetchTrainers();
      } else {
        const data = await res.json();
        setMsg(data.error || `Failed to ${isEditMode ? 'update' : 'add'} trainer`);
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    try {
      const res = await fetch(`/api/admin/trainers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg('Trainer deleted successfully!');
        fetchTrainers();
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout role="admin">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Trainers Directory</h1>
          <p className="text-textMuted">Manage your training staff and their specialties.</p>
        </div>
        <div className="flex items-center gap-4">
          {msg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-success/20 text-success border border-success/30 rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {msg}
            </motion.div>
          )}
          <button 
            onClick={openAddModal}
            className="px-6 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Trainer
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search trainers..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-textMuted border-b border-border/50 bg-surface/20">
                <th className="py-4 px-6 font-semibold">Name</th>
                <th className="py-4 px-6 font-semibold">Specialty</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-textMuted">Loading trainers...</td>
                </tr>
              ) : trainers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-textMuted">No trainers found.</td>
                </tr>
              ) : (
                trainers.map((trainer, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={trainer.id} 
                    className="border-b border-border/30 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-accent font-bold">
                          {trainer.name ? trainer.name.charAt(0) : 'T'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{trainer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-textMuted">
                      {trainer.specialty || 'General Fitness'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(trainer)}
                          className="p-2 text-textMuted hover:text-accent transition-colors bg-surface rounded-lg border border-border">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trainer.id)}
                          className="p-2 text-textMuted hover:text-danger transition-colors bg-surface rounded-lg border border-border">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-white font-display">{isEditMode ? 'Edit Trainer' : 'Add New Trainer'}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-textMuted hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddTrainer} className="space-y-4">
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Username</label>
                    <input type="text" required={!isEditMode} disabled={isEditMode} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent transition disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Password {isEditMode && '(Leave blank to keep current)'}</label>
                    <input type="password" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Specialty</label>
                    <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent transition" placeholder="e.g. Yoga & Pilates" />
                  </div>
                  
                  <button type="submit" className="w-full py-3 mt-4 bg-accent hover:bg-accentHover text-white rounded-xl font-bold transition">
                    {isEditMode ? 'Update Trainer' : 'Create Trainer'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
