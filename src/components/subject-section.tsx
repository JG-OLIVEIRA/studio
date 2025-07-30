import * as LucideIcons from 'lucide-react';
import type { Subject, Teacher } from '@/lib/types';
import TeacherCard from '@/components/teacher-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SubjectSectionProps {
  subject: Subject;
}

const calculateAverageRating = (teacher: Teacher) => {
  if (teacher.reviews.length === 0) return 0;
  const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / teacher.reviews.length;
};

// Helper to get the icon component from its name string
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
      // Sort by average rating in descending order
      return b.averageRating - a.averageRating;
    });

  const Icon = getIconComponent(subject.iconName);

  return (
    <section aria-labelledby={`subject-title-${subject.name.replace(/\s+/g, '-')}`}>
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle id={`subject-title-${subject.name.replace(/\s+/g, '-')}`} className="flex items-center gap-3 text-2xl font-semibold">
            <Icon className="h-6 w-6 text-primary" />
            {subject.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {sortedTeachers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedTeachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={{...teacher, subject: subject.name}}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhum professor cadastrado nesta matéria ainda.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
