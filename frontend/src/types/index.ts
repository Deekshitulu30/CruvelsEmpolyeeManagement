export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeId: string | null;
  name: string;
  employeeCode: string | null;
}

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  designation?: string;
  joining_date: string;
  manager_id?: string;
  manager_name?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  leave_type: 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_by_email?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminDashboard {
  role: 'ADMIN';
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    presentToday: number;
    absentToday: number;
    pendingLeaves: number;
  };
  departmentBreakdown: { name: string; count: number }[];
  recentLeaveRequests: LeaveRequest[];
  recentEmployees: Employee[];
}

export interface ManagerDashboard {
  role: 'MANAGER';
  stats: {
    teamSize: number;
    presentToday: number;
    absentToday: number;
    pendingLeaves: number;
  };
  pendingLeaveRequests: LeaveRequest[];
  teamMembers: (Employee & { today_attendance?: string; check_in?: string; check_out?: string })[];
}

export interface EmployeeDashboard {
  role: 'EMPLOYEE';
  todayAttendance: Attendance | null;
  attendanceSummary: { present: number; absent: number; late: number; half_day: number };
  leaveSummary: { pending: number; approved: number; rejected: number };
  recentLeaveRequests: LeaveRequest[];
}

export type Dashboard = AdminDashboard | ManagerDashboard | EmployeeDashboard;
