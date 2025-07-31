
import { GraduationCap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getTeachersWithGlobalStats } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from './actions';
import { getAllTeachers } from './actions';
import { getSubjects } from '@/lib/data-service';
import WelcomeReviewDialog from '@/components/welcome-review-dialog';
import TeacherListClient from '@/components/teacher-list-client';

export default async function TeachersPage() {
  // Fetch all data in parallel
  const [teachers, subjects, allTeachersForForm] = await Promise.all([
    getTeachersWithGlobalStats(),
    getSubjects(),
    getAllTeachers()
  ]);
  
  const allSubjectNames = subjects.map(s => s.name).sort((a,b) => a.localeCompare(b));

  // Find a teacher to prompt the user for a review.
  // Priority 1: Teachers with zero reviews.
  // Priority 2: Teachers with few reviews (less than 2).
  const teachersWithNoReviews = teachers.filter(t => t.reviews.length === 0);
  let teacherToPrompt = null;

  if (teachersWithNoReviews.length > 0) {
    teacherToPrompt = teachersWithNoReviews[Math.floor(Math.random() * teachersWithNoReviews.length)];
  } else {
    const teachersWithFewReviews = teachers.filter(t => t.reviews.length < 2);
     if (teachersWithFewReviews.length > 0) {
        teacherToPrompt = teachersWithFewReviews[Math.floor(Math.random() * teachersWithFewReviews.length)];
     }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* The Welcome dialog will manage its own open state based on session storage */}
      {teacherToPrompt && (
        <WelcomeReviewDialog 
            teacherToPrompt={teacherToPrompt}
            allSubjectNames={allSubjectNames}
            onSubmit={handleAddTeacherOrReview}
        />
      )}
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
        
        <TeacherListClient initialTeachers={teachers} />

        <footer className="text-center mt-16 pb-8">
            <p className="text-sm text-muted-foreground">
                Desenvolvido por Jorge Oliveira com a ajuda da IA do Firebase.
            </p>
        </footer>
      </div>
    </div>
  );
}
