import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, User, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('gymUser', JSON.stringify(data));
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'trainer') navigate('/trainer');
        else navigate('/member');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex">
      {/* Gym Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/gym_login_bg.png")' }}
      />

      {/* Dramatic Overlay to make text and cards pop */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/70 to-[#050505]/95 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center lg:justify-between px-8 lg:px-24">
        
        {/* Left Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col items-start max-w-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/30 backdrop-blur-md">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-white">FitLife</h1>
          </div>
          <h2 className="text-5xl font-display font-black text-white leading-tight mb-6 title-glow">
            Forged in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sweat & Iron</span>
          </h2>
          <p className="text-lg text-textMuted mb-8">
            Experience the future of fitness management. Elite performance starts with unparalleled focus and precision.
          </p>
        </motion.div>

        {/* Right Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-10 relative overflow-hidden group">
            {/* Soft glowing orb behind the card */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Welcome Back</h3>
                <p className="text-sm text-textMuted">Authenticate to access the portal</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-textMuted" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface/50 border border-border rounded-xl text-white placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Username"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-textMuted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface/50 border border-border rounded-xl text-white placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Password"
                  />
                </div>

                <div className="flex items-center justify-between text-sm mt-2 mb-4">
                  <label className="flex items-center text-textMuted cursor-pointer hover:text-white transition">
                    <input type="checkbox" className="mr-2 rounded border-border bg-surface/50 accent-primary" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:text-primaryHover transition">Forgot Password?</button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:from-primaryHover hover:to-accent/80 text-white rounded-xl font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    'Ignite Session'
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-textMuted">
                  New to FitLife?{' '}
                  <button type="button" onClick={() => navigate('/signup')} className="text-primary hover:text-white font-bold transition-colors">
                    Create an Account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
