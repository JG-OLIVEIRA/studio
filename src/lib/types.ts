import type { LucideIcon } from "lucide-react";

export interface Review {
  id: number;
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface Teacher {
  id: number;
  name: string;
  reviews: Review[];
  subject?: string;
}

export interface Subject {
  id: number;
  name: string;
  iconName: string;
  teachers: Teacher[];
}
