
'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from '@/app/actions';
import { Input } from '@/components/ui/input';
import CourseFlowchart from './course-flowchart';
import { Accordion } from '@/components/ui/accordion';

interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
}

export default function TeacherRateClient({ initialSubjectsData }: TeacherRateClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  const allTeachers = initialSubjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = initialSubjectsData.map(s => s.name);

  const onAddTeacherOrReview = async (data: {
    teacherName: string;
    subjectName: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    await handleAddTeacherOrReview(data);
    setIsDialogOpen(false);
  };

  const handleSubjectClick = (subjectName: string) => {
    const subject = initialSubjectsData.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    if (subject) {
      const subjectId = `subject-${subject.id}`;
      // Use a callback with setOpenAccordionItems to ensure we have the latest state
      setOpenAccordionItems(prev => {
          if (prev.includes(subjectId)) {
              return prev; // Already open
          }
          return [...prev, subjectId]; // Add to open items
      });

      // Scroll after a short delay to allow the accordion to open
      setTimeout(() => {
        const element = document.getElementById(`subject-title-${subject.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // 300ms delay to match accordion animation
    }
  };

  const filteredSubjects = useMemo(() => {
    const sortedSubjects = [...initialSubjectsData].sort((a, b) => a.name.localeCompare(b.name));

    if (!searchQuery) {
      return sortedSubjects;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    
    return sortedSubjects.map(subject => {
        if (subject.name.toLowerCase().includes(lowercasedQuery)) {
            return subject;
        }
        const matchingTeachers = subject.teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(lowercasedQuery)
        );
        if (matchingTeachers.length > 0) {
            return { ...subject, teachers: matchingTeachers };
        }
        return null;
    }).filter((s): s is Subject => s !== null);

  }, [initialSubjectsData, searchQuery]);

  
  const defaultAccordionValues = useMemo(() => {
    if (searchQuery) {
      return filteredSubjects.map(sub => `subject-${sub.id}`);
    }
    return [];
  }, [searchQuery, filteredSubjects]);

  const accordionValue = searchQuery ? defaultAccordionValues : openAccordionItems;

  return (
    <>
      <CourseFlowchart onSubjectClick={handleSubjectClick} />
      <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Pesquisar por disciplina ou professor..."
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

      <Accordion 
        type="multiple" 
        value={accordionValue}
        onValueChange={setOpenAccordionItems}
        className="space-y-2"
      >
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <SubjectSection key={subject.id} subject={subject} />
          ))
        ) : (
            <div className="text-center text-muted-foreground py-12">
                {initialSubjectsData.length > 0 ? (
                     <>
                        <p className="font-semibold text-lg">Nenhum resultado encontrado para "{searchQuery}".</p>
                        <p className="mt-2 text-sm">Tente um termo de busca diferente.</p>
                     </>
                ) : (
                    <>
                        <p className="font-semibold text-lg">Nenhuma matéria cadastrada ainda.</p>
                        <p className="mt-2 text-sm">Seja o primeiro a adicionar um professor e uma matéria!</p>
                    </>
                )}
            </div>
        )}
      </Accordion>
    </>
  );
}
