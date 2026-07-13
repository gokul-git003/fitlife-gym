import { useState, useEffect } from 'react';
import { Download, FileText, Users, DollarSign, Activity } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminReports() {
  const [reportData, setReportData] = useState<any>({ payments: [], attendance: [], memberships: [] });
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, membership, attendance

  useEffect(() => {
    fetch('/api/reports/full')
      .then(res => res.json())
      .then(data => setReportData(data))
      .catch(console.error);
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const renderTable = (data: any[]) => {
    if (data.length === 0) return <p className="text-textMuted p-4">No data available for this report.</p>;
    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-textMuted bg-white/5">
              {headers.map(h => (
                <th key={h} className="p-4 font-bold uppercase text-xs tracking-wider">{h.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {headers.map(h => (
                  <td key={h} className="p-4 text-sm text-white">{String(row[h])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getActiveData = () => {
    if (activeTab === 'revenue') return reportData.payments;
    if (activeTab === 'membership') return reportData.memberships;
    return reportData.attendance;
  };

  return (
    <Layout role="admin">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">System Reports</h1>
          <p className="text-textMuted">Generate, view, and export detailed system reports</p>
        </div>
        <div className="flex gap-4 no-print">
          <button 
            onClick={() => downloadCSV(getActiveData(), `${activeTab}_report`)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 font-bold"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2 font-bold"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
        <div 
          onClick={() => setActiveTab('revenue')}
          className={`glass-card p-6 cursor-pointer transition-all border ${activeTab === 'revenue' ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-white/10'}`}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-xl ${activeTab === 'revenue' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-textMuted'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Revenue Report</h3>
          </div>
          <p className="text-sm text-textMuted">View all payments and financial transactions.</p>
        </div>

        <div 
          onClick={() => setActiveTab('membership')}
          className={`glass-card p-6 cursor-pointer transition-all border ${activeTab === 'membership' ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-white/10'}`}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-xl ${activeTab === 'membership' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-textMuted'}`}>
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Membership Report</h3>
          </div>
          <p className="text-sm text-textMuted">Track active, expired, and cancelled plans.</p>
        </div>

        <div 
          onClick={() => setActiveTab('attendance')}
          className={`glass-card p-6 cursor-pointer transition-all border ${activeTab === 'attendance' ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-white/10'}`}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-xl ${activeTab === 'attendance' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-textMuted'}`}>
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Attendance Report</h3>
          </div>
          <p className="text-sm text-textMuted">Monitor daily check-ins and gym usage.</p>
        </div>
      </div>

      <div className="glass-card p-6 print-container">
        <h2 className="text-xl font-bold text-white mb-6 capitalize">{activeTab} Data</h2>
        {renderTable(getActiveData())}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { background: white !important; color: black !important; border: 1px solid #ccc; box-shadow: none !important; }
          .print-container * { color: black !important; border-color: #eee !important; }
          body { background: white !important; }
        }
      `}</style>
    </Layout>
  );
}
