import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserSquare2, 
  Calendar, CreditCard, Activity, Settings, 
  LogOut, Bell, Search, Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'trainer' | 'member';
}

export default function Layout({ children, role }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('gymUser');
    if (!userStr) {
      navigate('/');
    } else {
      const user = JSON.parse(userStr);
      if (user.role !== role) navigate(`/${user.role}`);
      setUserName(user.name || user.username);
    }
  }, [navigate, role]);

  const handleLogout = () => {
    localStorage.removeItem('gymUser');
    navigate('/');
  };

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Members', icon: Users, path: '/admin/members' },
        { name: 'Trainers', icon: UserSquare2, path: '/admin/trainers' },
        { name: 'Memberships', icon: CreditCard, path: '/admin/memberships' },
        { name: 'Attendance', icon: Activity, path: '/admin/attendance' },
        { name: 'Calendar', icon: Calendar, path: '/admin/calendar' },
        { name: 'Audit Logs', icon: Settings, path: '/admin/audit' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
        { name: 'Reports', icon: Activity, path: '/admin/reports' },
        { name: 'Profile', icon: UserSquare2, path: '/profile' },
      ];
    }
    if (role === 'trainer') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/trainer' },
        { name: 'Classes', icon: Calendar, path: '/trainer/classes' },
        { name: 'Workouts', icon: Activity, path: '/trainer/workouts' },
        { name: 'Calendar', icon: Calendar, path: '/trainer/calendar' },
        { name: 'Profile', icon: UserSquare2, path: '/profile' },
      ];
    }
    return [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/member' },
      { name: 'Classes', icon: Calendar, path: '/member/classes' },
      { name: 'Workouts', icon: Activity, path: '/member/workouts' },
      { name: 'Payments', icon: CreditCard, path: '/member/payments' },
      { name: 'Profile', icon: UserSquare2, path: '/profile' },
    ];
  };

  const navItems = getNavItems();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="glass-card m-4 hidden md:flex flex-col relative z-20 border-r border-border/50"
      >
        <div className="p-6 flex items-center justify-between border-b border-border/30">
          <motion.div 
            animate={{ opacity: sidebarOpen ? 1 : 0 }}
            className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2 whitespace-nowrap"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            FitLife
          </motion.div>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (location.pathname === `/${role}` && idx === 0);
            return (
              <div 
                key={item.name} 
                onClick={() => navigate(item.path)}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  isActive ? 'text-white bg-white/10' : 'text-textMuted hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary z-0"
                  />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-textMuted group-hover:text-primary transition-colors'}`} />
                  <motion.span animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }} className="font-medium whitespace-nowrap overflow-hidden">
                    {item.name}
                  </motion.span>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30">
          <div 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 rounded-xl cursor-pointer text-danger hover:bg-danger/10 transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            <motion.span animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }} className="font-medium whitespace-nowrap overflow-hidden ml-4">
              Logout
            </motion.span>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="h-20 glass flex items-center justify-between px-8 relative z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/10 text-textMuted transition">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-surface/50 border border-border/50 rounded-full px-4 py-2 w-64 focus-within:w-80 focus-within:border-primary/50 transition-all duration-300">
              <Search className="w-4 h-4 text-textMuted" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder-textMuted" />
            </div>
          </div>
          
          <div className="flex items-center gap-6 relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-white/10 text-textMuted transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />
            </button>
            
            {showNotifications && (
              <div className="absolute top-full right-16 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-border font-bold text-white">Notifications</div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex gap-3 items-start border-b border-border/50 pb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Welcome to FitLife Portal!</p>
                      <p className="text-xs text-textMuted mt-1">Check out your dashboard to get started.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">System updated successfully</p>
                      <p className="text-xs text-textMuted mt-1">All features are now fully functional.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{userName}</p>
                <p className="text-xs text-primary capitalize">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                  <UserSquare2 className="w-5 h-5 text-textMuted" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
