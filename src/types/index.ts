// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  STUDENT = 'student'
}

// Job Types
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  salaryType: SalaryType;
  location: string;
  category: JobCategory;
  workingHours: WorkingHours;
  startDate: Date;
  endDate?: Date;
  maxApplicants: number;
  currentApplicants: number;
  status: JobStatus;
  employerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SalaryType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum JobCategory {
  FOOD_SERVICE = 'food_service',
  RETAIL = 'retail',
  TUTORING = 'tutoring',
  OFFICE_WORK = 'office_work',
  EVENT_STAFF = 'event_staff',
  DELIVERY = 'delivery',
  OTHER = 'other'
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CLOSED = 'closed'
}

export interface WorkingHours {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

// Application Types
export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  salaryType: SalaryType;
  location: string;
  category: JobCategory;
  workingHours: WorkingHours;
  startDate: string;
  endDate?: string;
  maxApplicants: number;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobStatus;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Query Types
export interface JobQuery {
  page?: number;
  limit?: number;
  category?: JobCategory;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  status?: JobStatus;
  search?: string;
}

export interface ApplicationQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  jobId?: string;
  studentId?: string;
} 