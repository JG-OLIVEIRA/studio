
import type { LucideIcon } from "lucide-react";

export interface Review {
  id: number;
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  report_count: number;
  report_approvals: number;
  teacherName?: string;
  subjectName?: string;
}

export interface Teacher {
  id: number;
  name: string;
  reviews: Review[];
  subject?: string; // Context-specific subject
  subjects?: Set<string>; // All subjects taught
  averageRating?: number;
}

export interface Subject {
  id: number;
  name: string;
  iconName: string;
  teachers: Teacher[];
}
