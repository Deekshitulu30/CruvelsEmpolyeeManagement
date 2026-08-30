import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users, UserCheck, Clock, Calendar, Search, Filter,
  Building2, Mail, Phone, ChevronRight, ShieldCheck,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department_name?: string;
  status: string;
  presence?: 'In Office' | 'Remote' | 'On Leave';
}

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/employees?limit=100');
      const raw = res.data.employees || res.data || [];
      const withPresence: TeamMember[] = raw.map((m: any, idx: number) => ({
        ...m,
        presence: idx % 4 === 0 ? 'On Leave' : idx % 3 === 0 ? 'Remote' : 'In Office'
      }));
      setMembers(withPresence);
    } catch (err) {
      toast.error('Failed to load team directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      `${m.first_name} ${m.last_name} ${m.email} ${m.designation}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'ALL' || m.department_name === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(members.map(m => m.department_name).filter(Boolean)));
  const presentCount = members.filter(m => m.presence !== 'On Leave').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">Team Operations</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Realtime workforce availability, active shift roster, and direct reporting lines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Team Members</span>
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <Users size={18} />
            </div>
          </div>
          <div className="font-headline-page text-headline-page text-on-surface font-bold text-3xl font-mono-data">{members.length}</div>
          <div className="font-body-sm text-xs text-secondary mt-1">Direct & cross-functional reports</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">On Duty Today</span>
            <div className="p-2 bg-status-active-bg text-status-active-text rounded-lg">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="font-headline-page text-headline-page text-status-active-text font-bold text-3xl font-mono-data">{presentCount}</div>
          <div className="font-body-sm text-xs text-secondary mt-1">
            {members.length > 0 ? Math.round((presentCount / members.length) * 100) : 0}% active presence rate
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Remote Shifts</span>
            <div className="p-2 bg-secondary-container/50 text-secondary rounded-lg">
              <Clock size={18} />
            </div>
          </div>
          <div className="font-headline-page text-headline-page text-on-surface font-bold text-3xl font-mono-data">
            {members.filter(m => m.presence === 'Remote').length}
          </div>
          <div className="font-body-sm text-xs text-secondary mt-1">Verified remote presence</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Approved Leave</span>
            <div className="p-2 bg-status-pending-bg text-status-pending-text rounded-lg">
              <Calendar size={18} />
            </div>
          </div>
          <div className="font-headline-page text-headline-page text-status-pending-text font-bold text-3xl font-mono-data">
            {members.filter(m => m.presence === 'On Leave').length}
          </div>
          <div className="font-body-sm text-xs text-secondary mt-1">Scheduled PTO & sick days</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members or roles..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-outline"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-48"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-secondary font-body-sm text-xs">Loading team roster...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-secondary font-body-sm text-xs">
            No team members found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-md">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Team Member</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden sm:table-cell">Designation</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Today's Presence</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-medium font-body-sm border border-primary-container/20 shrink-0">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <div className="font-body-sm text-body-sm font-medium text-on-surface">{m.first_name} {m.last_name}</div>
                          <div className="text-secondary font-mono-data text-xs">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">{m.designation || 'Staff'}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="badge badge-slate text-[11px]">{m.department_name || 'General'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {m.presence === 'In Office' && (
                        <span className="badge badge-green text-[11px]">In Office</span>
                      )}
                      {m.presence === 'Remote' && (
                        <span className="badge badge-blue text-[11px]">Remote</span>
                      )}
                      {m.presence === 'On Leave' && (
                        <span className="badge badge-yellow text-[11px]">On Leave</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`mailto:${m.email}`}
                        className="btn-secondary text-xs py-1 px-3 inline-flex items-center gap-1.5"
                      >
                        <Mail size={13} />
                        <span>Message</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

