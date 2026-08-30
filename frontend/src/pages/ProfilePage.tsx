import React, { useEffect, useState } from 'react';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import type { Employee } from '../types';
import { LoadingSpinner, ErrorState, EmployeeStatusBadge, PageHeader } from '../components/shared';
import { format } from '../utils/formatters';
import { Mail, Phone, Briefcase, Building2, Calendar, User } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    employeeService.getMe()
      .then(setProfile)
      .catch(() => setError('Unable to load profile.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorState text={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">Employee Profile</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Detailed employee identity, organization placement, and contact records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary text-3xl font-bold font-headline">
            {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-xl">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="font-body-sm text-sm text-secondary mt-1">{profile?.designation || 'Employee'}</p>
            <div className="mt-3 flex justify-center gap-2">
              <EmployeeStatusBadge status={profile?.status || 'ACTIVE'} />
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-purple' : user?.role === 'MANAGER' ? 'badge-blue' : 'badge-slate'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <div className="text-xs font-mono-data text-secondary bg-surface-container-low border border-outline-variant/30 px-3 py-1 rounded-lg">
            {profile?.employee_code}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-5">Employee Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoRow icon={<Mail size={16} />} label="Work Email" value={profile?.email} />
            <InfoRow icon={<Phone size={16} />} label="Phone Number" value={profile?.phone || '—'} />
            <InfoRow icon={<Building2 size={16} />} label="Department" value={profile?.department_name || '—'} />
            <InfoRow icon={<Briefcase size={16} />} label="Designation" value={profile?.designation || '—'} />
            <InfoRow icon={<User size={16} />} label="Reports To" value={profile?.manager_name || '—'} />
            <InfoRow icon={<Calendar size={16} />} label="Joining Date" value={format.date(profile?.joining_date || '')} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 bg-surface-container-low border border-outline-variant/30 rounded-lg flex items-center justify-center text-primary shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <div className="font-label-caps text-[11px] text-secondary uppercase mb-0.5">{label}</div>
      <div className="font-body-sm text-sm text-on-surface font-medium">{value || '—'}</div>
    </div>
  </div>
);

