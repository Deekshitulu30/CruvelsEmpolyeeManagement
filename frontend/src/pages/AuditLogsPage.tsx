import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState } from '../components/shared';
import { TableSkeleton } from '../components/shared/SkeletonLoader';
import { format } from '../utils/formatters';
import {
  ShieldCheck, Search, Filter, ChevronLeft, ChevronRight,
  User, Globe, Clock, ShieldAlert, Activity
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const LIMIT = 15;

  const fetchAuditLogs = useCallback(() => {
    setIsLoading(true);
    setError('');
    api.get('/audit-logs', {
      params: {
        page,
        limit: LIMIT,
        action: actionFilter || undefined,
        search: search.trim() || undefined,
      },
    })
      .then(res => {
        setLogs(res.data.data);
        setTotal(res.data.total);
      })
      .catch(() => setError('Unable to load security audit logs.'))
      .finally(() => setIsLoading(false));
  }, [page, actionFilter, search]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  const getActionBadge = (action: string) => {
    if (action.includes('FAIL') || action.includes('REJECT')) {
      return 'badge-red';
    }
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('SUCCESS')) {
      return 'badge-green';
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'badge-blue';
    }
    return 'badge-purple';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">Security & Audit Logs</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Immutable tracking of operations, authentication events, and administrative actions ({total} records).
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex gap-3 flex-wrap items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Search by actor email, entity, or action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-outline"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-56"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE_EMPLOYEE">CREATE_EMPLOYEE</option>
          <option value="UPDATE_EMPLOYEE">UPDATE_EMPLOYEE</option>
          <option value="UPDATE_EMPLOYEE_STATUS">UPDATE_EMPLOYEE_STATUS</option>
          <option value="CHECK_IN">CHECK_IN</option>
          <option value="CHECK_OUT">CHECK_OUT</option>
          <option value="CREATE_LEAVE_REQUEST">CREATE_LEAVE_REQUEST</option>
          <option value="APPROVE_LEAVE_REQUEST">APPROVE_LEAVE_REQUEST</option>
          <option value="REJECT_LEAVE_REQUEST">REJECT_LEAVE_REQUEST</option>
        </select>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : error ? (
          <ErrorState text={error} onRetry={fetchAuditLogs} />
        ) : logs.length === 0 ? (
          <EmptyState text="No audit records found matching your query." icon={<Activity size={36} className="text-outline" />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body-md">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Timestamp</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Action</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">User / Actor</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Target / Entity</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-bright transition-colors">
                      <td className="py-3 px-4 text-secondary whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono-data text-xs">
                          <Clock size={13} className="text-outline shrink-0" />
                          <span>{format.datetime(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={getActionBadge(log.action)}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-primary shrink-0" />
                          <span className="font-mono-data text-xs">{log.user_email || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-body-sm text-xs">
                        {log.entity_type ? (
                          <span>
                            {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ''}
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-secondary font-mono-data text-xs">
                        <div className="flex items-center gap-1.5">
                          <Globe size={12} className="text-outline shrink-0" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/30 bg-surface-container-low">
                <span className="font-body-sm text-body-sm text-secondary">
                  Page <span className="font-mono-data text-on-surface font-semibold">{page}</span> of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

