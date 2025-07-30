'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, PlusCircle } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

// NOTE: This component is a client component, but it fetches server-side data.
// We are using a server action (`addTeacherOrReview` which then calls the data service)
// to handle mutations, and we need a way to tell Next.js to re-fetch the data
// on the server and send it back to the client. The standard way for this in App Router
// is `revalidatePath`. However, we cannot call it directly from a client component.
// So, we create a new server action here to do just that.

async function revalidateAndFetchData() {
    'use server';
    // This will clear the cache for the home page, forcing a re-fetch of data
    // on the next render. We don't actually need `revalidatePath` for `getSubjects` to be called
    // again on page reload, but it's crucial for soft navigations if we had them.
    // revalidatePath('/'); 
    // For now, simply calling the data fetching function is enough as we reload the page.
    return DataService.getSubjects();
}


export default function Home() {
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on initial component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await revalidateAndFetchData();
      setSubjectsData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const allTeachers = subjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = subjectsData.map(s => s.name);

  const handleAddTeacherOrReview = async (data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    // We call the server action to add the data to the DB.
    await DataService.addTeacherOrReview(data);
    
    // After adding, close the dialog and refetch the data to show the update.
    setIsDialogOpen(false);
    setLoading(true);
    const updatedData = await revalidateAndFetchData();
    setSubjectsData(updatedData);
    setLoading(false);
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
