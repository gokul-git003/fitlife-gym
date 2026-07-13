import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle2, Lock, Camera } from 'lucide-react';
import Layout from '../components/Layout';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    try {
      const res = await fetch(`/api/user/${user.id}`);
      const data = await res.json();
      setProfile(data);
      setName(data.name || '');
      setUsername(data.username || '');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    try {
      const res = await fetch(`/api/user/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Profile updated successfully!');
        
        // Update local storage name
        user.name = data.name;
        user.username = data.username;
        localStorage.setItem('gymUser', JSON.stringify(user));
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMsg(data.error || 'Failed to update profile');
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network error');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    try {
      const res = await fetch(`/api/user/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setMsg(data.error || 'Failed to update password');
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network error');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/user/${user.id}/avatar`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, avatarUrl: data.avatarUrl }));
        setMsg('Profile picture updated!');
        
        // Update user in local storage to trigger layout re-render if needed
        user.avatarUrl = data.avatarUrl;
        localStorage.setItem('gymUser', JSON.stringify(user));
      } else {
        setMsg(data.error || 'Upload failed');
      }
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Network error during upload');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    return (
      <Layout role={user?.role || 'member'}>
        <div className="flex items-center justify-center h-64">
          <p className="text-textMuted">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  const userStr = localStorage.getItem('gymUser');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <Layout role={user?.role || 'member'}>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">My Profile</h1>
          <p className="text-textMuted">Manage your personal information and security.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-surface border-2 border-primary/30 flex items-center justify-center overflow-hidden relative">
                {profile?.avatarUrl ? (
                  <img src={`http://localhost:3000${profile.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-textMuted opacity-50" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-[#0a0a0a] flex items-center justify-center text-white hover:bg-primaryHover transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <h2 className="text-2xl font-bold text-white capitalize">{profile?.name || profile?.username}</h2>
            <p className="text-primary font-medium capitalize mb-2">{profile?.role}</p>
            <p className="text-xs text-textMuted mb-6">Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
          </motion.div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="text-primary w-5 h-5" /> General Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-textMuted mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-2">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="px-6 py-3 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>

          {/* Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-accent w-5 h-5" /> Security
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/5 rounded-xl font-bold transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
