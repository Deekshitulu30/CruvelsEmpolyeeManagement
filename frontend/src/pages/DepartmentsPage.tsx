import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Building2, Users, Plus, Layers, Search, Briefcase,
  CheckCircle2, ArrowUpRight, DollarSign, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
  code: string;
  headcount: number;
  lead: string;
  budget: string;
  description: string;
}

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 1,
      name: 'Engineering',
      code: 'ENG',
      headcount: 24,
      lead: 'Vikram Sharma',
      budget: '$450,000 / yr',
      description: 'Platform architecture, distributed systems, security, and developer infrastructure.'
    },
    {
      id: 2,
      name: 'Product & Design',
      code: 'PRD',
      headcount: 8,
      lead: 'Ananya Roy',
      budget: '$180,000 / yr',
      description: 'Product lifecycle, UX research, UI design systems, and user feedback synthesis.'
    },
    {
      id: 3,
      name: 'Human Resources & People Ops',
      code: 'HRO',
      headcount: 5,
      lead: 'Priya Nair',
      budget: '$95,000 / yr',
      description: 'Talent acquisition, compliance, workplace benefits, and payroll management.'
    },
    {
      id: 4,
      name: 'Customer Success & Support',
      code: 'CSS',
      headcount: 12,
      lead: 'Rohan Mehta',
      budget: '$140,000 / yr',
      description: 'Tier-1 and Tier-2 client resolution, enterprise SLAs, and onboarding guidance.'
    },
    {
      id: 5,
      name: 'Finance & Operations',
      code: 'OPS',
      headcount: 6,
      lead: 'Deepak Rao',
      budget: '$110,000 / yr',
      description: 'Corporate accounting, financial planning, vendor contracts, and risk analysis.'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newLead, setNewLead] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      toast.error('Please specify department name and code.');
      return;
    }

    const newDept: Department = {
      id: Date.now(),
      name: newName.trim(),
      code: newCode.trim().toUpperCase(),
      headcount: 1,
      lead: newLead.trim() || 'Unassigned',
      budget: newBudget.trim() || '$75,000 / yr',
      description: newDescription.trim() || 'General operations department.'
    };

    setDepartments(prev => [newDept, ...prev]);
    toast.success(`Department ${newDept.name} created successfully.`);
    setShowAddModal(false);
    setNewName('');
    setNewCode('');
    setNewLead('');
    setNewBudget('');
    setNewDescription('');
  };

  const filteredDepts = departments.filter(d =>
    `${d.name} ${d.code} ${d.lead}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHeadcount = departments.reduce((acc, d) => acc + d.headcount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">Organization & Departments</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Organizational hierarchy, functional divisions, headcounts, and allocated operational budgets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <span className="material-symbols-outlined text-[18px]">domain_add</span>
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Active Divisions</span>
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <Layers size={18} />
            </div>
          </div>
          <div className="font-display-hero-mobile text-display-hero-mobile text-on-surface font-bold text-3xl font-mono-data">{departments.length}</div>
          <div className="text-secondary font-body-sm text-xs mt-1">All organizational units</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Org Headcount</span>
            <div className="p-2 bg-status-active-bg text-status-active-text rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="font-display-hero-mobile text-display-hero-mobile text-status-active-text font-bold text-3xl font-mono-data">{totalHeadcount}</div>
          <div className="text-secondary font-body-sm text-xs mt-1">Assigned full-time personnel</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Budget Overview</span>
            <div className="p-2 bg-secondary-container/50 text-secondary rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="font-display-hero-mobile text-display-hero-mobile text-on-surface font-bold text-3xl font-mono-data">$975,000</div>
          <div className="text-secondary font-body-sm text-xs mt-1">Approved FY operational run-rate</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments or leads..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-outline"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDepts.map((d) => (
            <div key={d.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary font-bold text-xs font-mono-data">
                    {d.code}
                  </div>
                  <div>
                    <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">{d.name}</h3>
                    <span className="font-body-sm text-xs text-secondary">Lead: {d.lead}</span>
                  </div>
                </div>
                <span className="badge badge-slate text-[11px]">{d.headcount} members</span>
              </div>

              <p className="font-body-sm text-xs text-secondary leading-relaxed mb-4">
                {d.description}
              </p>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-body-sm text-secondary">
                <span>Budget: <strong className="text-on-surface font-mono-data">{d.budget}</strong></span>
                <span className="text-primary font-medium text-xs flex items-center gap-0.5 hover:underline cursor-pointer">
                  <span>View Roster</span>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal p-6 space-y-4 max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">Add Department</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div>
                <label className="form-label text-xs">Department Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence Research"
                  className="form-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Code (3-4 letters) *</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="AIR"
                    maxLength={5}
                    className="form-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Division Lead</label>
                  <input
                    type="text"
                    value={newLead}
                    onChange={(e) => setNewLead(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Annual Budget</label>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="$200,000 / yr"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Mission / Scope</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Scope of work and responsibilities..."
                  rows={3}
                  className="form-input text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

