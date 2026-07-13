import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, X } from 'lucide-react';
import Layout from '../components/Layout';

export default function MemberPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [paymentStep, setPaymentStep] = useState<'details' | 'otp' | 'upi_approval'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const [payForm, setPayForm] = useState({
    amount: 49.99,
    description: 'Monthly Membership'
  });
  
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');

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

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayModal(false);
    setPaymentStep('details');
    setShowGatewayModal(true);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        setMsg('Card number must be exactly 16 digits');
        setTimeout(() => setMsg(''), 3000);
        return;
      }
      setPaymentStep('otp');
    } else {
      setPaymentStep('upi_approval');
      // Simulate waiting for user to approve on their phone, then auto-process
      setTimeout(() => {
        processSecurePayment();
      }, 5000);
    }
  };

  const processSecurePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userStr = localStorage.getItem('gymUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.profileId) return;

    setIsProcessing(true);

    try {
      // Simulate secure processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const res = await fetch('/api/member/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          member_id: user.profileId, 
          amount: Number(payForm.amount), 
          description: payForm.description 
        })
      });

      if (res.ok) {
        setMsg('Payment processed securely and successfully!');
        setShowGatewayModal(false);
        fetchPayments();
      } else {
        setMsg('Failed to process payment');
      }
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('Network Error.');
    } finally {
      setIsProcessing(false);
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
            onClick={() => setShowPayModal(true)}
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
              className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-white font-display">Make a Payment</h2>
                <button onClick={() => setShowPayModal(false)} className="text-textMuted hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Description</label>
                    <input type="text" required value={payForm.description} onChange={e => setPayForm({...payForm, description: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-textMuted mb-2">Amount ($)</label>
                    <input type="number" step="0.01" required value={payForm.amount} onChange={e => setPayForm({...payForm, amount: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition" />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-3 mt-4 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition"
                  >
                    Proceed to Secure Payment
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Mock Secure Gateway Modal */}
        {showGatewayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Secure Checkout</h2>
                    <p className="text-xs text-textMuted">Amount: ${payForm.amount.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => {
                  setShowGatewayModal(false);
                  setPaymentStep('details');
                }} className="text-textMuted hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {msg && (
                  <div className="mb-4 p-3 bg-warning/20 text-warning border border-warning/30 rounded-lg text-sm text-center font-bold">
                    {msg}
                  </div>
                )}
                
                {paymentStep === 'details' && (
                  <>
                    <div className="flex gap-2 p-1 mb-6 bg-background rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${paymentMethod === 'card' ? 'bg-surface text-white shadow' : 'text-textMuted hover:text-white'}`}
                      >
                        Credit/Debit Card
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${paymentMethod === 'upi' ? 'bg-surface text-white shadow' : 'text-textMuted hover:text-white'}`}
                      >
                        UPI
                      </button>
                    </div>

                    <form onSubmit={handleDetailsSubmit} className="space-y-4">
                      {paymentMethod === 'card' ? (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Card Number</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted" />
                              <input type="text" placeholder="0000 0000 0000 0000" maxLength={16} required value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '')})} className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary transition" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Expiry</label>
                              <input type="text" placeholder="MM/YY" maxLength={5} required value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">CVV</label>
                              <input type="password" placeholder="123" maxLength={4} required value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition" />
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">UPI ID</label>
                            <input type="text" placeholder="username@upi" required value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition" />
                          </div>
                          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                            <p className="text-sm text-primary text-center">A payment request will be sent to your UPI app for approval.</p>
                          </div>
                        </motion.div>
                      )}
                      
                      <button 
                        type="submit" 
                        className="w-full py-3.5 mt-6 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      >
                        Request Secure Payment
                      </button>
                    </form>
                  </>
                )}

                {paymentStep === 'otp' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Verify Your Card</h3>
                    <p className="text-sm text-textMuted mb-6">We've sent a 6-digit OTP to your registered mobile number ending in ****1234.</p>
                    <form onSubmit={processSecurePayment} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Enter OTP (e.g. 123456)" 
                        maxLength={6} 
                        required 
                        value={otp} 
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                        className="w-full text-center tracking-widest text-xl bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition" 
                      />
                      <button 
                        type="submit" 
                        disabled={isProcessing || otp.length < 4}
                        className="w-full py-3.5 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Confirm & Pay'
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {paymentStep === 'upi_approval' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
                       <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                       <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Awaiting UPI Approval</h3>
                    <p className="text-sm text-textMuted max-w-[250px]">
                      Open your UPI app for <b>{upiId}</b> and approve the payment request of <b>${payForm.amount.toFixed(2)}</b>.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
