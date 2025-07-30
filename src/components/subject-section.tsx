import type { Subject } from '@/lib/types';
import TeacherCard from '@/components/teacher-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SubjectSectionProps {
  subject: Subject;
}

export default function SubjectSection({ subject }: SubjectSectionProps) {
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
            {subject.teachers
              .sort((a, b) => b.rating - a.rating)
              .map((teacher) => (
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
