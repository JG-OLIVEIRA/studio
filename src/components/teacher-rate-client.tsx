'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from '@/app/actions';

interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
}

export default function TeacherRateClient({ initialSubjectsData }: TeacherRateClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allTeachers = initialSubjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = initialSubjectsData.map(s => s.name);

  const onAddTeacherOrReview = async (data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    // We call the server action to add the data to the DB.
    // revalidatePath('/') in the action will trigger a data refetch on the server.
    await handleAddTeacherOrReview(data);
    
    // After adding, just close the dialog.
    setIsDialogOpen(false);
  };

  return (
    <>
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
        {initialSubjectsData.length > 0 ? (
          initialSubjectsData.map((subject) => (
            <SubjectSection key={subject.name} subject={subject} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>Nenhuma matéria cadastrada ainda.</p>
            <p className="mt-2 text-sm">Seja o primeiro a adicionar um professor e uma matéria!</p>
          </div>
        )}
      </div>
    </>
  );
}
