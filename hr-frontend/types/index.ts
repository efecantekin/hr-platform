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

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  title: string;
}

export interface JobTitle {
  id: number;
  title: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  technologies: string;
  experienceYears: number;
  previousCompanies: string;
  university: string;
  department: string;
  referenceType: string; // INTERNAL, EXTERNAL
  referenceName: string;
  status: string;
}

export type QuestionType = "TEXT" | "RATING" | "MULTIPLE_CHOICE";

export interface Question {
  id?: number; // Backend ID'si (kaydedilince gelir)
  localId?: string; // Frontend'de DnD için geçici ID
  text: string;
  type: QuestionType;
  options?: string; // "İyi,Kötü,Orta" gibi
  orderIndex: number;
}

export interface SurveyTemplate {
  id?: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface PerformanceReview {
  id: number;
  templateId: number;
  templateTitle?: string;
  employeeId: number;
  employeeName?: string; // UI için
  reviewerId: number;
  reviewerName?: string; // UI için
  status: "PENDING" | "COMPLETED";
  dueDate?: string;
  reviewType: "SELF" | "MANAGER" | "SUBORDINATE" | "PEER"; // Değerlendirme Tipi
  period: string; // Dönem (Örn: 2024-Q1)
}

export interface ReviewResponse {
  questionId: number;
  questionText?: string;
  answerValue: string;
}

export interface Question {
  id?: number;
  text: string;
  type: "TEXT" | "RATING" | "MULTIPLE_CHOICE";
  options?: string; // Virgülle ayrılmış seçenekler
  orderIndex: number;
}

export interface SurveyTemplate {
  id?: number;
  title: string;
  description: string;
  questions: Question[];
}
