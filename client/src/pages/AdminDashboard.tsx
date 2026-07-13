import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981'];

const StatCard = ({ title, value, icon: Icon, trend, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
  >
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-textMuted font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white">{value}</h3>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm relative z-10">
      <span className="flex items-center text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
        <TrendingUp className="w-3 h-3 mr-1" /> {trend}
      </span>
      <span className="text-textMuted">vs last month</span>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalRevenue: 0 });
  const [advancedStats, setAdvancedStats] = useState<any>({
    revenueData: [],
    membershipData: [],
    classPopularity: [],
    attendanceData: []
  });

  useEffect(() => {
    // Fetch basic stats
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
      
    // Fetch advanced stats
    fetch('/api/admin/dashboard/advanced')
      .then(res => res.json())
      .then(data => setAdvancedStats(data))
      .catch(console.error);
  }, []);

  return (
    <Layout role="admin">
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-textMuted">Welcome back. Here's what's happening at FitLife today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Members" value={stats.totalMembers || '1,248'} icon={Users} trend="+12%" delay={0.1} />
        <StatCard title="Active Members" value={stats.activeMembers || '986'} icon={Activity} trend="+5%" delay={0.2} />
        <StatCard title="Monthly Revenue" value={`$${stats.totalRevenue || '48,500'}`} icon={DollarSign} trend="+18%" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">Revenue Analytics</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={advancedStats.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Class Popularity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-bold text-lg text-white mb-6">Class Popularity</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={advancedStats.classPopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="bookings"
                >
                  {advancedStats.classPopularity.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {advancedStats.classPopularity.map((c: any, i: number) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-textMuted">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {c.name}
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Membership Growth */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">Membership Growth</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedStats.membershipData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="members" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attendance Trends */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-bold text-lg text-white mb-6">Attendance Trends (7 days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={advancedStats.attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="checkins" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
