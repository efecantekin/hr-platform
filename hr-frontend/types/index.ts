export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  phoneNumber?: string;
  hireDate?: string;
  managerId?: number | null;
  position?: string | null;
  children?: Employee[];
}

export interface HierarchyAssignmentRequest {
    subordinateId: number;
    managerId: number;
    managerPosition: string | null;
}

export interface AuthResponse {
  token: string;
  role: string;
  employeeId: number;
}

export interface AuthResponse {
  token: string;
  role: string;
  employeeId: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface HierarchyAssignmentRequest {
    subordinateId: number;
    managerId: number;
    managerPosition: string | null;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
}

export interface DocumentRequest {
  id: number;
  employeeId: number;
  documentType: string;
  description: string;
  status: string;
  requestedAt: string;
  assignedHrId: number | null;
}

export interface MenuItem {
  id: number;
  title: string;
  url?: string;
  parentId?: number | null;
  sortOrder: number;
  children?: MenuItem[];
  roles?: string[];
}

export interface SystemScreen {
  id: number;
  name: string;
  url: string;
}