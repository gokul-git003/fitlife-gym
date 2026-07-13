import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
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
    email: '',
    phone: ''
  });

  const fetchMembers = () => {
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ username: '', password: '', name: '', email: '', phone: '' });
    setShowAddModal(true);
  };

  const openEditModal = (member: any) => {
    setIsEditMode(true);
    setEditingId(member.id);
    setFormData({ 
      username: member.username || '', 
      password: '', // blank for edit
      name: member.name || '', 
      email: '', 
      phone: '' 
    });
    setShowAddModal(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = '/api/admin/members';
      let method = 'POST';
      let body = { ...formData };
      
      if (isEditMode) {
        url = `/api/admin/members/${editingId}`;
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
        setMsg(`Member ${isEditMode ? 'updated' : 'added'} successfully!`);
        setShowAddModal(false);
        setFormData({ username: '', password: '', name: '', email: '', phone: '' });
        fetchMembers();
      } else {
        const data = await res.json();
        setMsg(data.error || `Failed to ${isEditMode ? 'update' : 'add'} member`);
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg('Member deleted successfully!');
        fetchMembers();
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
          <h1 className="text-3xl font-display font-bold text-white mb-2">Members Directory</h1>
          <p className="text-textMuted">Manage and view all registered members.</p>
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
            className="px-6 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Member
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
              placeholder="Search members..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-white placeholder-textMuted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-textMuted border-b border-border/50 bg-surface/20">
                <th className="py-4 px-6 font-semibold">Name</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-textMuted">Loading members...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-textMuted">No members found.</td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={member.id} 
                    className="border-b border-border/30 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                          {member.name ? member.name.charAt(0) : 'M'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name || 'Member'}</p>
                          <p className="text-xs text-textMuted">{member.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-2 text-textMuted hover:text-primary transition-colors bg-surface rounded-lg border border-border">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
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

      {/* Add Member Modal */}
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
                <h2 className="text-xl font-bold text-white font-display">{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-textMuted hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Username</label>
                    <input type="text" required={!isEditMode} disabled={isEditMode} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Password {isEditMode && '(Leave blank to keep current)'}</label>
                    <input type="password" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Full Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-textMuted mb-2">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                    </div>
                    <div>
                      <label className="block text-sm text-textMuted mb-2">Phone</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-3 mt-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition">
                    {isEditMode ? 'Update Member' : 'Create Member'}
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
