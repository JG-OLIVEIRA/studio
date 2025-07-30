'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, PlusCircle } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview, getSubjectsData } from '@/app/actions';

export default function Home() {
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getSubjectsData();
    setSubjectsData(data);
    setLoading(false);
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  const allTeachers = subjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = subjectsData.map(s => s.name);

  const onAddTeacherOrReview = async (data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    // We call the server action to add the data to the DB.
    await handleAddTeacherOrReview(data);
    
    // After adding, close the dialog and refetch the data to show the update.
    setIsDialogOpen(false);
    await fetchData(); // Refetch data
  };

  // If the data is loading, show a loading state
  if (loading) {
    return (
      <main className="min-h-screen w-full bg-background font-sans">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <p className="text-center text-lg">Carregando dados do banco de dados...</p>
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
                onSubmit={onAddTeacherOrReview}
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
            <SubjectSection key={subject.name} subject={subject} onUpdate={fetchData} />
          ))}
        </div>
      </div>
    </main>
  );
}
