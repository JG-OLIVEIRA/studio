
import { GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { getTeachersWithGlobalStats } from '@/lib/data-service';
import TeacherListItem from '@/components/teacher-list-item';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function TeachersPage() {
  const teachers = await getTeachersWithGlobalStats();
  
  // Sort teachers by average rating descending, then by number of reviews descending
  const sortedTeachers = teachers.sort((a, b) => {
    const ratingA = a.averageRating ?? 0;
    const ratingB = b.averageRating ?? 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return b.reviews.length - a.reviews.length;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8 pb-4 border-b">
            <div className='flex items-center gap-4'>
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">
                    Todos os Professores
                </h1>
            </div>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
        </header>
        
        <div className="space-y-4">
          {sortedTeachers.length > 0 ? (
            sortedTeachers.map((teacher, index) => (
              <TeacherListItem key={teacher.id} teacher={teacher} rank={index + 1} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum professor encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
