'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FlaskConical, Palette, ScrollText, Sigma, GraduationCap, PlusCircle } from 'lucide-react';
import type { Subject, Teacher } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import * as DataService from '@/lib/data-service';

export default function Home() {
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Carrega os dados iniciais do serviço de dados.
    // No futuro, isso buscará os dados do seu banco de dados MySQL.
    const data = DataService.getSubjects();
    setSubjectsData(data);
  }, []);

  const allTeachers = subjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = subjectsData.map(s => s.name);

  const handleAddTeacherOrReview = (data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    // Chama o serviço de dados para adicionar a nova informação.
    // No futuro, isso irá interagir com seu banco de dados MySQL.
    DataService.addTeacherOrReview(data);

    // Recarrega os dados para refletir a mudança.
    const updatedData = DataService.getSubjects();
    setSubjectsData(updatedData);
    
    setIsDialogOpen(false);
  };

  // Se os dados ainda não carregaram, pode mostrar um loader
  if (subjectsData.length === 0) {
    return (
      <main className="min-h-screen w-full bg-background font-sans">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <p>Carregando...</p>
        </div>
      </main>
    )
  }

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

        <div className="flex justify-center mb-8">
            <AddTeacherOrReviewDialog
                allTeachers={allTeachers}
                allSubjectNames={allSubjectNames}
                onSubmit={handleAddTeacherOrReview}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <Button size="lg" onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Adicionar Professor ou Avaliação
                </Button>
            </AddTeacherOrReviewDialog>
        </div>

        <div className="space-y-16">
          {subjectsData.map((subject) => (
            <SubjectSection key={subject.name} subject={subject} />
          ))}
        </div>
      </div>
    </main>
  );
}
