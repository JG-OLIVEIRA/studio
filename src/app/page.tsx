
import { BookOpen, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { getTeachersWithGlobalStats, getSubjects } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from './actions';
import TeacherListClient from '@/components/teacher-list-client';
import MainLayout from '@/components/main-layout';
import WelcomeReviewHandler from '@/components/welcome-review-handler';

export default async function TeachersPage() {
  // Fetch all data in parallel
  const [teachers, subjects] = await Promise.all([
    getTeachersWithGlobalStats(),
    getSubjects(),
  ]);
  
  const allSubjectNames = subjects.map(s => s.name).sort((a,b) => a.localeCompare(b.name));
  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name));

  const headerContent = (
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          O lugar central para encontrar e avaliar os professores de Ciência da Computação.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AddTeacherOrReviewDialog
                allSubjectNames={allSubjectNames}
                allTeachers={teachers} // Pass the full teacher objects
                onSubmit={handleAddTeacherOrReview}
            />
            <Button asChild variant="outline">
                <Link href="/subjects">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver por Matéria
                </Link>
            </Button>
        </div>

        <div className="mt-8 max-w-3xl w-full p-4 bg-secondary/50 border border-primary/20 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Megaphone className="h-5 w-5 text-primary"/>
                <h3 className="text-md font-semibold text-foreground">Nosso Compromisso</h3>
            </div>
            <p className="text-sm text-muted-foreground">
                Este espaço foi criado para feedback construtivo. Lembre-se de ser respeitoso em suas avaliações, focando na didática e na sua experiência de aprendizado. O objetivo é ajudar alunos e professores a crescerem juntos.
            </p>
        </div>
      </div>
  );

  return (
    <MainLayout headerProps={{
      pageTitle: 'CcompTeacherRate',
      pageIconName: 'GraduationCap',
      children: headerContent
    }}>
      <WelcomeReviewHandler 
        teachers={teachers}
        onSubmit={handleAddTeacherOrReview}
      />
      <div className="container mx-auto px-4 py-8">
        <TeacherListClient initialTeachers={sortedTeachers} />

        <footer className="text-center mt-16 pb-8">
            <p className="text-sm text-muted-foreground">
                Desenvolvido com a ajuda da IA do Firebase.
            </p>
        </footer>
      </div>
    </MainLayout>
  );
}
