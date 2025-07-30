import { GraduationCap } from 'lucide-react';
import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';
import { TopTeacherCard } from '@/components/top-teacher-card';
import type { Teacher } from '@/lib/types';

const calculateAverageRating = (teacher: Teacher) => {
  if (teacher.reviews.length === 0) return 0;
  const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / teacher.reviews.length;
};

export default async function Home() {
  // Fetch data on the server before rendering the page.
  const subjectsData = await getSubjectsData();

  const allTeachers = subjectsData.flatMap(s => 
    s.teachers.map(t => ({
      ...t,
      subject: s.name,
      averageRating: calculateAverageRating(t)
    }))
  ).filter(t => t.reviews.length > 0);

  const topTeacher = allTeachers.length > 0 
    ? allTeachers.reduce((prev, current) => (prev.averageRating > current.averageRating) ? prev : current)
    : null;

  return (
    <main className="min-h-screen w-full bg-background font-sans">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              TeacherRate
            </h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Descubra os melhores professores, avaliados por alunos como você.
          </p>
        </header>
        
        {topTeacher && <TopTeacherCard teacher={topTeacher} />}

        {/* All client-side interactions are now handled in this component */}
        <TeacherRateClient initialSubjectsData={subjectsData} />

      </div>
    </main>
  );
}
