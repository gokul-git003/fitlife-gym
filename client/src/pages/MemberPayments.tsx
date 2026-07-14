import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, X } from 'lucide-react';
import Layout from '../components/Layout';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function MemberPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');
  const [utr, setUtr] = useState('');
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  const [payForm, setPayForm] = useState({
    amount: 49.99,
    description: 'Monthly Membership'
  });

  const fetchPayments = () => {
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (user && user.profileId) {
      fetch(`/api/member/payments?memberId=${user.profileId}`)
        .then(res => res.json())
        .then(data => {
          setPayments(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d+$/.test(cleanUtr)) {
      setMsg('Please enter a valid 12-digit Transaction ID (UTR)');
      return;
    }
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) {
      setMsg('User not found.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/member/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          member_id: user.profileId, 
          amount: Number(payForm.amount), 
          description: `${payForm.description} (UTR: ${utr})` 
        })
      });
      
      if (res.ok) {
        setMsg('Payment submitted successfully!');
        setShowPayModal(false);
        setUtr('');
        fetchPayments();
      } else {
        const errorData = await res.json();
        setMsg(errorData.error || 'Failed to submit payment');
      }
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || 'Error submitting payment');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  return (
    <Layout role="member">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Payment History</h1>
          <p className="text-textMuted">View your membership and transaction details.</p>
        </div>
        <div className="flex gap-4 items-center">
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
            onClick={() => {
              setModalStep(1);
              setShowPayModal(true);
            }}
            className="px-6 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Pay Now
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-textMuted border-b border-border/50 bg-surface/20">
                <th className="py-4 px-6 font-semibold">Transaction ID</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Amount</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-textMuted">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-textMuted">No payment history found.</td>
                </tr>
              ) : (
                payments.map((payment, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={payment.id} 
                    className="border-b border-border/30 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {payment.id ? payment.id.toString().toUpperCase() : 'TRX'}
                    </td>
                    <td className="py-4 px-6 text-sm text-textMuted">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-white">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {payment.status === 'completed' ? (
                        <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pay Now Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white font-display">Make a Payment</h2>
                <button onClick={() => setShowPayModal(false)} className="text-textMuted hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  {modalStep === 1 ? (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-sm text-textMuted mb-2">Description</label>
                        <input type="text" required value={payForm.description} onChange={e => setPayForm({...payForm, description: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                      </div>
                      <div>
                        <label className="block text-sm text-textMuted mb-2">Amount ($)</label>
                        <input type="number" step="0.01" required value={payForm.amount} onChange={e => setPayForm({...payForm, amount: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setModalStep(2)}
                        className="w-full py-3 mt-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        Next
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl mb-4 shadow-inner">
                        <div className="w-56 h-56 md:w-64 md:h-64 overflow-hidden rounded-lg relative flex items-center justify-center mb-3">
                          <img src="/qr-code.png" alt="Scan to Pay" className="w-full h-full object-cover object-center" />
                        </div>
                        <p className="text-sm font-bold text-gray-800">Scan using any UPI App</p>
                      </div>
                      <div>
                        <label className="block text-sm text-textMuted mb-2">Transaction ID (UTR)</label>
                        <input type="text" required pattern="\d{12}" maxLength={12} minLength={12} placeholder="Enter 12-digit UTR number" value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, ''))} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <button 
                          type="button"
                          onClick={() => setModalStep(1)}
                          className="w-1/3 py-3 bg-surface hover:bg-background text-white border border-border rounded-xl font-bold transition"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={isProcessing || utr.trim().length !== 12}
                          className="w-2/3 py-3 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Payment'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
