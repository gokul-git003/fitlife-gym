import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminAttendance() {
  const [logs, setLogs] = useState<any[]>([]);

  // Table features
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('check_in_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Table Logic
  const filteredLogs = logs.filter(log => 
    (log.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (sortField === 'check_in_time' || sortField === 'check_out_time') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage) || 1;
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to desc for dates
    }
  };

  return (
    <Layout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Attendance System</h1>
        <p className="text-textMuted">Monitor member and trainer check-ins</p>
      </div>

      <div className="glass-card p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Check-ins</h2>
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
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 text-textMuted text-sm">
                <th className="p-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('check_in_time')}>
                  <div className="flex items-center gap-1">Check In <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('check_out_time')}>
                  <div className="flex items-center gap-1">Check Out <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log: any) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{log.name}</td>
                  <td className="p-4 text-textMuted">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {new Date(log.check_in_time).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-textMuted">
                    {log.check_out_time ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        {new Date(log.check_out_time).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-white/30">---</span>
                    )}
                  </td>
                  <td className="p-4">
                    {log.status === 'checked_in' ? (
                      <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold flex items-center gap-1 w-max">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white/10 text-textMuted rounded-full text-xs font-bold flex items-center gap-1 w-max">
                        <XCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-textMuted">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <p className="text-xs text-textMuted">
            Showing {Math.min(paginatedLogs.length, itemsPerPage)} of {sortedLogs.length} entries
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
    </Layout>
  );
}
