import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    gymName: 'FitLife Gym',
    businessHoursStart: '06:00',
    businessHoursEnd: '22:00',
    allowMemberSignups: true,
    requireEmailVerify: false
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.gymName) setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMsg('Settings saved successfully!');
      } else {
        setMsg('Failed to save settings.');
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network error.');
    }
  };

  return (
    <Layout role="admin">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Global Settings</h1>
          <p className="text-textMuted">Configure the gym rules and business hours.</p>
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 max-w-2xl"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="text-primary w-5 h-5" /> Gym Details
        </h3>
        
        {loading ? (
          <p className="text-textMuted">Loading settings...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm text-textMuted mb-2">Gym Name</label>
              <input 
                type="text" 
                value={settings.gymName}
                onChange={e => setSettings({...settings, gymName: e.target.value})}
                className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-textMuted mb-2">Opening Time</label>
                <input 
                  type="time" 
                  value={settings.businessHoursStart}
                  onChange={e => setSettings({...settings, businessHoursStart: e.target.value})}
                  className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-2">Closing Time</label>
                <input 
                  type="time" 
                  value={settings.businessHoursEnd}
                  onChange={e => setSettings({...settings, businessHoursEnd: e.target.value})}
                  className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.allowMemberSignups}
                  onChange={e => setSettings({...settings, allowMemberSignups: e.target.checked})}
                  className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-background"
                />
                <div>
                  <span className="block text-white font-medium">Allow New Member Signups</span>
                  <span className="block text-xs text-textMuted">Enable or disable the public signup page.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.requireEmailVerify}
                  onChange={e => setSettings({...settings, requireEmailVerify: e.target.checked})}
                  className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-background"
                />
                <div>
                  <span className="block text-white font-medium">Require Email Verification</span>
                  <span className="block text-xs text-textMuted">New members must verify their email before logging in.</span>
                </div>
              </label>
            </div>

            <div className="pt-6">
              <button type="submit" className="px-6 py-3 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </Layout>
  );
}
