
'use client';

import * as LucideIcons from 'lucide-react';
import type { Subject, Teacher } from '@/lib/types';
import TeacherCard from '@/components/teacher-card';
import { Pencil } from 'lucide-react';
import { EditSubjectDialog } from './edit-subject-dialog';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import FeaturedTeacher from './featured-teacher';

const calculateAverageRating = (teacher: Teacher) => {
  if (teacher.reviews.length === 0) return 0;
  const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / teacher.reviews.length;
};

const getIconComponent = (iconName: string): React.ElementType => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.GraduationCap;
};


export default function SubjectSection({ subject }: SubjectSectionProps) {
  const sortedTeachers = subject.teachers
    .map(teacher => ({
      ...teacher,
      averageRating: calculateAverageRating(teacher),
    }))
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.reviews.length - a.reviews.length;
    });

  const topTeacher = sortedTeachers.length > 0 && sortedTeachers[0].averageRating >= 4 ? sortedTeachers[0] : null;

  const Icon = getIconComponent(subject.iconName);

  return (
    <AccordionItem value={`subject-${subject.id}`} className="bg-card border rounded-lg shadow-sm">
        <div className="flex items-center w-full group">
            <AccordionTrigger className="hover:no-underline flex-grow rounded-l-lg p-4">
                <div id={`subject-title-${subject.id}`} className="flex items-center gap-4 w-full">
                    <Icon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground text-left flex-1">
                    {subject.name}
                    </h3>
                    {topTeacher && <FeaturedTeacher teacher={topTeacher} />}
                </div>
            </AccordionTrigger>
            <EditSubjectDialog subject={subject}>
                <button 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors mr-4 ml-2"
                    aria-label={`Editar matéria ${subject.name}`}
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </EditSubjectDialog>
        </div>
      <AccordionContent>
        <div className="px-4 pb-4">
            {sortedTeachers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedTeachers.map((teacher) => (
                    <TeacherCard
                      key={teacher.id}
                      teacher={{...teacher, subject: subject.name}}
                      isTopTeacher={teacher.id === topTeacher?.id}
                    />
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4 border rounded-lg bg-background">Nenhum professor cadastrado nesta matéria ainda.</p>
            )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface SubjectSectionProps {
  subject: Subject;
}
