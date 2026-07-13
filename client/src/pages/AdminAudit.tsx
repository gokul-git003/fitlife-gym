import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ClipboardList, ShieldAlert, User, LogIn, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <LogIn className="w-5 h-5 text-success" />;
    if (action.includes('DELETE')) return <Trash2 className="w-5 h-5 text-error" />;
    if (action.includes('UPDATE')) return <User className="w-5 h-5 text-primary" />;
    return <ShieldAlert className="w-5 h-5 text-warning" />;
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-2">
            <ClipboardList className="text-primary w-8 h-8" /> System Audit Logs
          </h1>
          <p className="text-textMuted">Monitor system activity and security events.</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-6 flex justify-between items-center gap-4">
          <input 
            type="text" 
            placeholder="Search logs by action or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-surface border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {loading ? (
          <p className="text-textMuted">Loading audit logs...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-10">
            <ShieldAlert className="w-12 h-12 text-textMuted mx-auto mb-3" />
            <p className="text-textMuted">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-textMuted font-medium">Time</th>
                  <th className="pb-3 text-textMuted font-medium">Action</th>
                  <th className="pb-3 text-textMuted font-medium">User Role</th>
                  <th className="pb-3 text-textMuted font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm text-textMuted whitespace-nowrap">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-bold text-white">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-white">
                      <span className="bg-white/10 px-2 py-1 rounded capitalize">{log.userRole || 'system'}</span>
                    </td>
                    <td className="py-4 text-sm text-textMuted">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
