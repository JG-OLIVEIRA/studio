
import { GraduationCap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getTeachersWithGlobalStats } from '@/lib/data-service';
import TeacherListItem from '@/components/teacher-list-item';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from './actions';
import { getAllTeachers } from './actions';
import { getSubjects } from '@/lib/data-service';

export default async function TeachersPage() {
  // Fetch all data in parallel
  const [teachers, subjects, allTeachersForForm] = await Promise.all([
    getTeachersWithGlobalStats(),
    getSubjects(),
    getAllTeachers()
  ]);
  
  const allSubjectNames = subjects.map(s => s.name).sort((a,b) => a.localeCompare(b));

  // Sort teachers alphabetically by name
  const sortedTeachers = teachers.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-4 mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                CcompTeacherRate
                </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              O lugar central para encontrar e avaliar os professores de Ciência da Computação.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AddTeacherOrReviewDialog
                    allSubjectNames={allSubjectNames}
                    allTeachers={allTeachersForForm}
                    onSubmit={handleAddTeacherOrReview}
                />
                <Button asChild variant="outline">
                    <Link href="/subjects">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Ver por Matéria
                    </Link>
                </Button>
            </div>
        </header>
        
        <div className="space-y-4">
          {sortedTeachers.length > 0 ? (
            sortedTeachers.map((teacher, index) => (
              <TeacherListItem key={teacher.id} teacher={teacher} rank={index + 1} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
              <h2 className="text-xl font-semibold">Nenhum professor encontrado.</h2>
              <p className="mt-2">Seja o primeiro a adicionar uma avaliação e ajudar a comunidade!</p>
            </div>
          )}
        </div>

        <footer className="text-center mt-16 pb-8">
            <p className="text-sm text-muted-foreground">
                Desenvolvido por Jorge Oliveira com a ajuda da IA do Firebase.
            </p>
        </footer>
      </div>
    </div>
  );
}
