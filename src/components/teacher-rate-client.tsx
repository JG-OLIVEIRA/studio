
'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from '@/app/actions';
import { Input } from '@/components/ui/input';

interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
}

export default function TeacherRateClient({ initialSubjectsData }: TeacherRateClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) {
      return initialSubjectsData;
    }
    return initialSubjectsData.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialSubjectsData, searchQuery]);

  return (
    <>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Pesquisar por disciplina..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
        </div>
        <AddTeacherOrReviewDialog
            allTeachers={allTeachers}
            allSubjectNames={allSubjectNames}
            onSubmit={onAddTeacherOrReview}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        >
            <Button size="lg" onClick={() => setIsDialogOpen(true)} className="w-full">
                <PlusCircle className="mr-2 h-5 w-5" />
                Adicionar Professor ou Avaliação
            </Button>
        </AddTeacherOrReviewDialog>
      </div>

      <div className="space-y-16">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <SubjectSection key={subject.name} subject={subject} />
          ))
        ) : (
            <div className="text-center text-muted-foreground py-12">
                {initialSubjectsData.length > 0 ? (
                     <>
                        <p>Nenhuma disciplina encontrada para "{searchQuery}".</p>
                        <p className="mt-2 text-sm">Tente um termo de busca diferente.</p>
                     </>
                ) : (
                    <>
                        <p>Nenhuma matéria cadastrada ainda.</p>
                        <p className="mt-2 text-sm">Seja o primeiro a adicionar um professor e uma matéria!</p>
                    </>
                )}
            </div>
        )}
      </div>
    </>
  );
}
