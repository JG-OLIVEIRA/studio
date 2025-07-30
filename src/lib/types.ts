import type { LucideIcon } from "lucide-react";

export interface Teacher {
  id: number;
  name: string;
  rating: number;
  reviews: string[];
  subject?: string;
}

export interface Subject {
  name: string;
  icon: LucideIcon;
  teachers: Teacher[];
}
