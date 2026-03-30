export type UserRole = 'super_admin' | 'institute_admin' | 'student';
export type ExamStream = 'MPSC' | 'UPSC' | 'GROUP_B' | 'GROUP_C' | 'GROUP_D' | 'ALL_INDIA_SERVICES';
export type Language = 'en' | 'mr' | 'hi';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ViolationType =
  | 'multiple_faces' | 'no_face' | 'phone_detected'
  | 'book_detected' | 'tab_switch' | 'devtools_open'
  | 'face_mismatch' | 'fullscreen_exit';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: UserRole;
  institute_id?: string;
  is_active: boolean;
  profile_photo_url?: string;
  language_preference: Language;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  exam_streams: ExamStream[];
  profile_completed: boolean;
  total_exams_taken: number;
  total_score: number;
}

export interface Question {
  id: string;
  text: string;
  language: Language;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answers: number[];
  marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic?: string;
  explanation?: string;
  exam_stream?: ExamStream;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  exam_stream?: ExamStream;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_marking_enabled: boolean;
  questions?: Question[];
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'in_progress' | 'submitted' | 'auto_submitted' | 'timed_out';
  started_at: string;
  submitted_at?: string;
  total_score?: number;
  correct_count?: number;
  wrong_count?: number;
  skipped_count?: number;
  violation_count?: number;
  face_verified: boolean;
}

export interface ExamResult {
  submission_id: string;
  total_score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  time_taken_seconds: number;
  passed: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
