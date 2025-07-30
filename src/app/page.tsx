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
    name: 'Mathematics',
    icon: Sigma,
    teachers: [
      { id: 1, name: 'Dr. Evelyn Reed', reviews: [
          { id: 1, author: 'Student A', rating: 5, text: "Dr. Reed makes calculus understandable." },
          { id: 2, author: 'Student B', rating: 5, text: "Best math teacher I've ever had." },
          { id: 3, author: 'Student C', rating: 4, text: "Her explanations are crystal clear." }
      ] },
      { id: 2, name: 'Mr. Alan Turing', reviews: [
        { id: 4, author: 'Student D', rating: 5, text: "Great at breaking down complex problems." },
        { id: 5, author: 'Student E', rating: 4, text: "Sometimes moves a bit too fast." }
      ] },
      { id: 3, name: 'Ms. Julia Robinson', reviews: [
        { id: 6, author: 'Student F', rating: 5, text: "Very patient and always willing to help." },
        { id: 7, author: 'Student G', rating: 4, text: "Her passion for math is contagious." }
      ] },
    ],
  },
  {
    name: 'Science',
    icon: FlaskConical,
    teachers: [
      { id: 4, name: 'Prof. Marie Curie', reviews: [
          { id: 8, author: 'Student H', rating: 5, text: "Inspirational and brilliant." },
          { id: 9, author: 'Student I', rating: 5, text: "Lab sessions are the best part of the week." },
          { id: 10, author: 'Student J', rating: 5, text: "She pushes us to think critically." }
      ] },
      { id: 5, name: 'Dr. Carl Sagan', reviews: [
        { id: 11, author: 'Student K', rating: 5, text: "Makes you fall in love with the cosmos." },
        { id: 12, author: 'Student L', rating: 4, text: "His lectures are like watching a documentary." }
      ] },
    ],
  },
  {
    name: 'History',
    icon: ScrollText,
    teachers: [
      { id: 6, name: 'Dr. Howard Zinn', reviews: [
        { id: 13, author: 'Student M', rating: 5, text: "Offers a unique perspective on history." },
        { id: 14, author: 'Student N', rating: 4, text: "The reading list is heavy but worth it." }
      ] },
      { id: 7, name: 'Ms. Mary Beard', reviews: [
        { id: 15, author: 'Student O', rating: 5, text: "Brings ancient Rome to life!" },
        { id: 16, author: 'Student P', rating: 5, text: "Incredibly knowledgeable and engaging." },
        { id: 17, author: 'Student Q', rating: 5, text: "Her storytelling is top-notch." }
      ] },
    ],
  },
  {
    name: 'Literature',
    icon: BookOpen,
    teachers: [
      { id: 8, name: 'Mr. William Shakespeare', reviews: [
        { id: 18, author: 'Student R', rating: 4, text: "A bit dramatic, but knows his stuff." },
        { id: 19, author: 'Student S', rating: 4, text: "Challenging but rewarding class." }
      ] },
      { id: 9, name: 'Ms. Virginia Woolf', reviews: [
        { id: 20, author: 'Student T', rating: 5, text: "Deep thinker and fantastic discussion leader." },
        { id: 21, author: 'Student U', rating: 5, text: "Opened my eyes to new ways of reading." }
      ] },
      { id: 10, name: 'Prof. Toni Morrison', reviews: [
        { id: 22, author: 'Student V', rating: 5, text: "A true master of the craft." },
        { id: 23, author: 'Student W', rating: 5, text: "I'll never forget the lessons learned in her class." },
        { id: 24, author: 'Student X', rating: 5, text: "She is a legend." }
      ] },
    ],
  },
  {
    name: 'Art',
    icon: Palette,
    teachers: [
      { id: 11, name: 'Mr. Leonardo da Vinci', reviews: [
        { id: 25, author: 'Student Y', rating: 5, text: "A true Renaissance man. Teaches more than just painting." },
        { id: 26, author: 'Student Z', rating: 5, text: "His attention to detail is inspiring." }
      ] },
      { id: 12, name: 'Ms. Frida Kahlo', reviews: [
        { id: 27, author: 'Student AA', rating: 5, text: "Encourages us to find our own voice." },
        { id: 28, author: 'Student BB', rating: 4, text: "Very passionate and expressive." }
      ] },
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
      const subjectIndex = subjectsCopy.findIndex((s: Subject) => s.name === data.subjectName);

      if (subjectIndex === -1) {
        // This case should ideally be handled by the form validation (e.g., creating a new subject)
        // For now, we'll log an error.
        console.error("Subject not found, and creating new subjects is not implemented.");
        return prevSubjects;
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
            Discover the best teachers, reviewed by students like you.
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
