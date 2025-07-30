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


export default function SubjectSection({ subject }: SubjectSectionProps) {
  const sortedTeachers = subject.teachers
    .map(teacher => ({
      ...teacher,
      averageRating: calculateAverageRating(teacher),
    }))
    .sort((a, b) => {
      // Teachers with no reviews go to the end
      if (a.reviews.length === 0 && b.reviews.length > 0) return 1;
      if (b.reviews.length === 0 && a.reviews.length > 0) return -1;
      // Then sort by average rating
      return b.averageRating - a.averageRating;
    });

  return (
    <section aria-labelledby={`subject-title-${subject.name.replace(/\s+/g, '-')}`}>
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle id={`subject-title-${subject.name.replace(/\s+/g, '-')}`} className="flex items-center gap-3 text-2xl font-semibold">
            <subject.icon className="h-6 w-6 text-primary" />
            {subject.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={{...teacher, subject: subject.name}}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
