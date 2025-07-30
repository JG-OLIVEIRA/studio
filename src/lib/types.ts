import type { LucideIcon } from "lucide-react";

export interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
}

export interface Teacher {
  id: number;
  name: string;
  reviews: Review[];
  subject?: string;
}

export interface Subject {
  name: string;
  iconName: string;
  teachers: Teacher[];
}
