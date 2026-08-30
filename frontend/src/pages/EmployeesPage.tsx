import React, { useEffect, useState, useCallback } from 'react';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import type { Employee, Department } from '../types';
import { Plus, Search, Edit2, UserX, UserCheck, ChevronLeft, ChevronRight, Sparkles, Heart, Coffee } from 'lucide-react';
import { EmptyState, ErrorState, EmployeeStatusBadge, Modal, PageHeader } from '../components/shared';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { TableSkeleton } from '../components/shared/SkeletonLoader';
import { format } from '../utils/formatters';
import api from '../services/api';
import toast from 'react-hot-toast';

// Authentic human quirks & passions (Anti-corporate personal touches)
const TEAM_QUIRKS: Record<string, string> = {
  'arjun.sharma@company.com': 'Filter coffee purist ☕ • Race-condition hunter • Hates unindexed foreign keys',
  'priya.singh@company.com': 'CSS micro-interaction fan ✨ • Once wrote a 999999 z-index hack • Badminton regular',
  'vikram.patel@company.com': 'PostgreSQL optimizer 🐘 • Will explain B-tree page splits to anyone who listens',
  'ananya.gupta@company.com': 'HR & Team happiness lead 🌴 • Believes sprint velocity is linked to cafeteria snack quality',
  'admin@company.com': 'Mission control caretaker 🛠️ • Keeping the servers humming & coffee brewed',
  'rahul.verma@company.com': 'DevOps whisperer 🐳 • Friday deployment skeptic • Mechanical keyboard collector',
};

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search with debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);

  // Status toggle confirmation modal
  const [statusTarget, setStatusTarget] = useState<Employee | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const LIMIT = 10;

  // 300ms Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchDepartments = () => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
  };

  const fetchEmployees = useCallback(() => {
    setIsLoading(true);
    setError('');
    employeeService.getAll({
      search: debouncedSearch,
      status: statusFilter,
      department: deptFilter,
      page,
      limit: LIMIT
    })
      .then(r => { setEmployees(r.data); setTotal(r.total); })
      .catch(() => setError('Unable to reach the employee directory right now.'))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, statusFilter, deptFilter, page]);

  useEffect(() => { fetchDepartments(); }, []);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleConfirmStatusToggle = async () => {
    if (!statusTarget) return;
    setIsTogglingStatus(true);
    const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await employeeService.updateStatus(statusTarget.id, newStatus);
      toast.success(
        newStatus === 'INACTIVE'
          ? `${statusTarget.first_name} has been deactivated.`
          : `${statusTarget.first_name} is back on active duty! 🎉`
      );
      setStatusTarget(null);
      fetchEmployees();
    } catch {
      toast.error('Could not update employee status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">
            {user?.role === 'MANAGER' ? 'Team Directory' : 'Employee Directory'}
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage employee records, organizational roles, and system access.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => { setEditTarget(null); setShowModal(true); }}
            className="btn-primary"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Employee</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search employees, roles, departments..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-outline"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          {user?.role === 'ADMIN' && (
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={LIMIT} cols={6} />
        ) : error ? (
          <ErrorState text={error} onRetry={fetchEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState
            text="No employees found"
            subtitle="Try changing your search query or reset filters."
            action={
              (searchInput || statusFilter || deptFilter) ? (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setStatusFilter(''); setDeptFilter(''); }}
                  className="btn-secondary text-xs"
                >
                  Reset all filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body-md">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Employee</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden sm:table-cell">ID</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden md:table-cell">Department</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden lg:table-cell">Designation</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider hidden xl:table-cell">Joined</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Status</th>
                    {user?.role === 'ADMIN' && (
                      <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-surface-bright transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-medium font-body-sm border border-primary-container/20 shrink-0">
                            {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-body-sm text-body-sm font-medium text-on-surface">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-secondary font-mono-data text-xs">
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono-data text-mono-data text-secondary hidden sm:table-cell">
                        {emp.employee_code}
                      </td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">
                        {emp.department_name || '—'}
                      </td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant hidden lg:table-cell">
                        {emp.designation || '—'}
                      </td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-secondary font-mono-data hidden xl:table-cell">
                        {format.date(emp.joining_date)}
                      </td>
                      <td className="py-3 px-4">
                        <EmployeeStatusBadge status={emp.status} />
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditTarget(emp); setShowModal(true); }}
                              className="text-secondary hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                              title={`Edit profile for ${emp.first_name}`}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatusTarget(emp)}
                              className={`p-1.5 rounded-lg hover:bg-surface-container transition-colors ${
                                emp.status === 'ACTIVE' ? 'text-secondary hover:text-error' : 'text-secondary hover:text-status-active-text'
                              }`}
                              title={emp.status === 'ACTIVE' ? 'Deactivate employee' : 'Reactivate employee'}
                            >
                              {emp.status === 'ACTIVE' ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/30 bg-surface-container-low">
                <span className="font-body-sm text-body-sm text-secondary">
                  Showing page <span className="font-mono-data text-on-surface font-semibold">{page}</span> of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary px-2.5 py-1.5 disabled:opacity-40 text-xs"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    className="btn-secondary px-2.5 py-1.5 disabled:opacity-40 text-xs"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {/* Confirmation Dialog before changing employee status */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmStatusToggle}
        title={statusTarget?.status === 'ACTIVE' ? `Deactivate ${statusTarget?.first_name}?` : `Reactivate ${statusTarget?.first_name}?`}
        message={
          statusTarget?.status === 'ACTIVE'
            ? `Deactivate ${statusTarget?.first_name} ${statusTarget?.last_name}? They will be immediately blocked from signing in and punching shifts until an admin reinstates them.`
            : `Reactivate ${statusTarget?.first_name}? Their portal login and attendance access will be restored immediately.`
        }
        confirmText={statusTarget?.status === 'ACTIVE' ? 'Yes, Deactivate' : 'Yes, Reactivate 🎉'}
        isDangerous={statusTarget?.status === 'ACTIVE'}
        isLoading={isTogglingStatus}
      />

      {/* Create / Edit Employee Modal */}
      {showModal && (
        <EmployeeFormModal
          departments={departments}
          employee={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSuccess={() => { setShowModal(false); setEditTarget(null); fetchEmployees(); }}
        />
      )}
    </div>
  );
};

interface EmployeeFormModalProps {
  departments: Department[];
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  departments, employee, onClose, onSuccess
}) => {
  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    phone: string;
    department_id: string;
    designation: string;
    joining_date: string;
  }>({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    password: '',
    role: employee?.role || 'EMPLOYEE',
    phone: employee?.phone || '',
    department_id: employee?.department_id || '',
    designation: employee?.designation || '',
    joining_date: employee?.joining_date ? employee.joining_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (employee) {
        await employeeService.update(employee.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          department_id: form.department_id || undefined,
          designation: form.designation,
          role: form.role,
          joining_date: form.joining_date,
        });
        toast.success(`${form.first_name}'s profile updated!`);
      } else {
        await employeeService.create(form);
        toast.success(`Welcome aboard to ${form.first_name}! 🎉`);
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to save employee profile.');
      toast.error(msg || 'Failed to save employee');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      title={employee ? `Edit ${employee.first_name}'s Profile` : 'Welcome a New Teammate 🎉'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">First Name *</label>
            <input
              type="text"
              required
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              placeholder="e.g. Maya"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              required
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              placeholder="e.g. Rao"
              className="form-input text-xs"
            />
          </div>
        </div>

        {!employee && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="name@company.com"
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters"
                minLength={6}
                className="form-input text-xs"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE' }))}
              className="form-select text-xs"
            >
              <option value="EMPLOYEE">Employee (Personal view)</option>
              <option value="MANAGER">Manager (Team lead)</option>
              <option value="ADMIN">Admin (Full access)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Department</label>
            <select
              value={form.department_id}
              onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
              className="form-select text-xs"
            >
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Designation / Title</label>
            <input
              type="text"
              value={form.designation}
              onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
              placeholder="e.g. Senior Frontend Engineer"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              value={form.joining_date}
              onChange={e => setForm(f => ({ ...f, joining_date: e.target.value }))}
              className="form-input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+91 98765 43210"
            className="form-input text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary text-xs"
          >
            {isSaving ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>

  );
};
