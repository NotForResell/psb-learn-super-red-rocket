export type UserRole = "student" | "teacher";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  avatar_url?: string | null;
}

export interface Course {
  id: number;
  title: string;
  short_description: string;
  long_description: string;
  level: string;
  tags?: string;
  estimated_hours?: number;
  is_published: boolean;
  owner_id: number;
  created_at: string;
}

export interface Module {
  id: number;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  short_description: string;
  content_html: string;
  order_index: number;
}

export interface CourseDetail extends Course {
  modules: Module[];
  lessons_count: number;
  assignments_count: number;
}

export interface CourseStructureResponse {
  course_id: number;
  modules: { id: number; title: string; order_index: number; lessons: LessonNavItem[] }[];
}

export interface LessonNavItem {
  id: number;
  title: string;
  short_description: string;
  order_index: number;
}

export interface Assignment {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  max_score: number;
  due_date?: string;
  created_at: string;
}

export type SubmissionStatus = "draft" | "submitted" | "checked";

export interface SubmissionFile {
  id: number;
  file_path: string;
  original_name: string;
  content_type: string;
  uploaded_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  attempt_number: number;
  status: SubmissionStatus;
  score?: number;
  student_comment?: string;
  teacher_comment?: string;
  submitted_at?: string;
  checked_at?: string;
  file_url?: string | null;
  attachment_url?: string | null;
  submission_url?: string | null;
  files: SubmissionFile[];
}

export interface AssignmentWithSubmission {
  assignment: Assignment;
  submission?: Submission;
}

export interface LessonWithAssignment {
  lesson: Lesson;
  assignment?: Assignment;
}

export interface ProgressSnapshot {
  id: number;
  student_id: number;
  course_id: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  avg_score?: number;
  updated_at: string;
}

export interface GradeItem {
  assignment_id: number;
  assignment_title: string;
  course_id: number;
  course_title: string;
  status: SubmissionStatus;
  attempt_number?: number | null;
  max_score: number;
  score?: number | null;
  teacher_comment?: string | null;
  submitted_at?: string | null;
  checked_at?: string | null;
}

export type DeadlineSeverity = "normal" | "due_soon" | "overdue";

export interface DeadlineItem {
  assignment_id: number;
  assignment_title: string;
  course_id: number;
  course_title: string;
  lesson_id?: number | null;
  lesson_title?: string | null;
  due_date?: string | null;
  status: "not_submitted" | "submitted" | "checked";
  severity: DeadlineSeverity;
  days_left?: number | null;
}

export type FeedItemType = "new_assignment" | "grade_updated";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  created_at: string;
  course_id: number;
  course_title: string;
  assignment_id?: number | null;
  assignment_title?: string | null;
  score?: number | null;
  max_score?: number | null;
  short_text: string;
}

export type QuestionType = "single" | "multiple";

export interface TestSummary {
  id: number;
  title: string;
  description?: string | null;
  timeLimitMinutes?: number | null;
}

export interface TestOption {
  id: number;
  text: string;
}

export interface TestQuestion {
  id: number;
  text: string;
  type: QuestionType;
  orderIndex: number;
  options: TestOption[];
}

export interface TestDetails {
  id: number;
  courseId: number;
  title: string;
  description?: string | null;
  timeLimitMinutes?: number | null;
  questions: TestQuestion[];
}

export interface TestAttemptResult {
  id: number;
  testId: number;
  studentId: number;
  startedAt: string;
  finishedAt?: string | null;
  score?: number | null;
  maxScore?: number | null;
}

export interface ChatMessage {
  id: number;
  courseId: number;
  authorId: number;
  authorName: string;
  isTeacher: boolean;
  text: string;
  createdAt: string;
}
