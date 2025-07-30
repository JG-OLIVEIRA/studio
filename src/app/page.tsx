'use client';

import { useState } from 'react';
import { BookOpen, FlaskConical, Palette, ScrollText, Sigma, GraduationCap, PlusCircle } from 'lucide-react';
import type { Subject, Teacher } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
// This is where you should fetch your data from a database.
// The data below is mocked for demonstration purposes.
// Replace this with your actual data fetching logic (e.g., from Firebase,
// Supabase, or your own backend API).
// ============================================================================
const initialSubjectsData: Subject[] = [
  {
    name: 'Matemática',
    icon: Sigma,
    teachers: [
      { id: 1, name: 'Dr. Evelyn Reed', reviews: [] },
      { id: 2, name: 'Mr. Alan Turing', reviews: [] },
      { id: 3, name: 'Ms. Julia Robinson', reviews: [] },
    ],
  },
  {
    name: 'Ciências',
    icon: FlaskConical,
    teachers: [
      { id: 4, name: 'Prof. Marie Curie', reviews: [] },
      { id: 5, name: 'Dr. Carl Sagan', reviews: [] },
    ],
  },
  {
    name: 'História',
    icon: ScrollText,
    teachers: [
      { id: 6, name: 'Dr. Howard Zinn', reviews: [] },
      { id: 7, name: 'Ms. Mary Beard', reviews: [] },
    ],
  },
  {
    name: 'Literatura',
    icon: BookOpen,
    teachers: [
      { id: 8, name: 'Mr. William Shakespeare', reviews: [] },
      { id: 9, name: 'Ms. Virginia Woolf', reviews: [] },
      { id: 10, name: 'Prof. Toni Morrison', reviews: [] },
    ],
  },
  {
    name: 'Arte',
    icon: Palette,
    teachers: [
      { id: 11, name: 'Mr. Leonardo da Vinci', reviews: [] },
      { id: 12, name: 'Ms. Frida Kahlo', reviews: [] },
    ],
  },
];
// ============================================================================
// END OF DATABASE CONFIGURATION
// ============================================================================

export default function Home() {
  const [subjectsData, setSubjectsData] = useState<Subject[]>(initialSubjectsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allTeachers = subjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subject: s.name })));
  const allSubjectNames = subjectsData.map(s => s.name);

  const handleAddTeacherOrReview = (data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
  }) => {
    setSubjectsData(prevSubjects => {
      const subjectsCopy = JSON.parse(JSON.stringify(prevSubjects));
      let subjectIndex = subjectsCopy.findIndex((s: Subject) => s.name === data.subjectName);

      // If subject doesn't exist, create it.
      if (subjectIndex === -1) {
        const newSubject: Subject = {
          name: data.subjectName,
          // A default icon can be used or a more complex logic to assign one
          icon: GraduationCap, 
          teachers: []
        };
        subjectsCopy.push(newSubject);
        subjectIndex = subjectsCopy.length - 1;
      }
      
      const subject = subjectsCopy[subjectIndex];
      let teacher = subject.teachers.find((t: Teacher) => t.name.toLowerCase() === data.teacherName.toLowerCase());

      const newReview = {
        id: Date.now(),
        author: data.reviewAuthor,
        rating: data.reviewRating,
        text: data.reviewText,
      };

      if (teacher) {
        // Add review to existing teacher
        teacher.reviews.push(newReview);
      } else {
        // Add new teacher with the first review
        const newTeacher: Teacher = {
          id: Date.now(),
          name: data.teacherName,
          reviews: [newReview],
        };
        subject.teachers.push(newTeacher);
      }

      return subjectsCopy;
    });

    setIsDialogOpen(false);
  };


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
