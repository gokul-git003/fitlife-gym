import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminMemberships() {
  const [plans, setPlans] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // New Plan form state
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);

  // Table features
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('member_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Assign Plan form state
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [actionType, setActionType] = useState('assign'); // assign, renew, upgrade

  const fetchData = async () => {
    try {
      const [plansRes, membersRes] = await Promise.all([
        fetch('/api/memberships/plans'),
        fetch('/api/admin/members')
      ]);
      const plansData = await plansRes.json();
      const membersData = await membersRes.json();
      
      setPlans(plansData);
      setMembers(membersData);

      // We extract active memberships from membersData
      const activeMemberships = membersData.map((m: any) => ({
        member_id: m.id,
        member_name: m.name,
        status: m.membership_status,
        end_date: m.membership_end_date
      })).filter((m: any) => m.status);

      setMemberships(activeMemberships);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/memberships/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, duration, price })
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = actionType === 'assign' ? '/api/memberships/assign' : 
                       actionType === 'renew' ? '/api/memberships/renew' : '/api/memberships/upgrade';
                       
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          member_id: selectedMember, 
          plan_id: selectedPlan,
          new_plan_id: selectedPlan // used for upgrade
        })
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Table Logic
  const filteredMemberships = memberships.filter(m => 
    (m.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMemberships = [...filteredMemberships].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (sortField === 'end_date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMemberships.length / itemsPerPage) || 1;
  const paginatedMemberships = sortedMemberships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Layout role="admin">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Membership Management</h1>
          <p className="text-textMuted">Create plans and manage member subscriptions</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsAssignModalOpen(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Manage Subscription
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plans List */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Membership Plans</h2>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 bg-surface/50 border border-border rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-textMuted">{plan.duration} days • ${plan.price}</p>
                </div>
              </div>
            ))}
            {plans.length === 0 && <p className="text-textMuted">No plans found. Create one.</p>}
          </div>
        </div>

        {/* Member Subscriptions */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Active Subscriptions</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-surface border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-border text-textMuted text-sm">
                  <th className="p-3 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('member_name')}>
                    <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-3 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('end_date')}>
                    <div className="flex items-center gap-1">Expires <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-3 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedMemberships.map((m, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white font-medium">{m.member_name}</td>
                    <td className="p-3 text-textMuted">{new Date(m.end_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedMemberships.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-textMuted text-sm">No subscriptions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <p className="text-xs text-textMuted">
              Showing {Math.min(paginatedMemberships.length, itemsPerPage)} of {sortedMemberships.length} entries
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-surface border border-border rounded-lg text-white hover:bg-white/10 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-surface border border-border rounded-lg text-white hover:bg-white/10 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Plan Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface border border-border p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Create Plan</h2>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-sm text-textMuted mb-2">Plan Name</label>
                  <input type="text" required value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Duration (Days)</label>
                  <input type="number" required value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Price ($)</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Create Plan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign/Renew/Upgrade Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-surface border border-border p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Manage Subscription</h2>
              <form onSubmit={handleAssignPlan} className="space-y-4">
                <div>
                  <label className="block text-sm text-textMuted mb-2">Action</label>
                  <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white">
                    <option value="assign">Assign New Plan</option>
                    <option value="renew">Renew Existing Plan</option>
                    <option value="upgrade">Upgrade/Downgrade Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Select Member</label>
                  <select required value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white">
                    <option value="">Choose Member...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.memberProfile?.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Select Plan</label>
                  <select required value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white">
                    <option value="">Choose Plan...</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold">Submit Action</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
