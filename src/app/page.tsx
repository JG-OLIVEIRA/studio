import { BookOpen, FlaskConical, Palette, ScrollText, Sigma, GraduationCap } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
// This is where you should fetch your data from a database.
// The data below is mocked for demonstration purposes.
// Replace this with your actual data fetching logic (e.g., from Firebase,
// Supabase, or your own backend API).
// ============================================================================
const subjectsData: Subject[] = [
  {
    name: 'Mathematics',
    icon: Sigma,
    teachers: [
      { id: 1, name: 'Dr. Evelyn Reed', rating: 4.8, reviews: ["Dr. Reed makes calculus understandable.", "Best math teacher I've ever had.", "Her explanations are crystal clear."] },
      { id: 2, name: 'Mr. Alan Turing', rating: 4.5, reviews: ["Great at breaking down complex problems.", "Sometimes moves a bit too fast."] },
      { id: 3, name: 'Ms. Julia Robinson', rating: 4.6, reviews: ["Very patient and always willing to help.", "Her passion for math is contagious."] },
    ],
  },
  {
    name: 'Science',
    icon: FlaskConical,
    teachers: [
      { id: 4, name: 'Prof. Marie Curie', rating: 4.9, reviews: ["Inspirational and brilliant.", "Lab sessions are the best part of the week.", "She pushes us to think critically."] },
      { id: 5, name: 'Dr. Carl Sagan', rating: 4.7, reviews: ["Makes you fall in love with the cosmos.", "His lectures are like watching a documentary."] },
    ],
  },
  {
    name: 'History',
    icon: ScrollText,
    teachers: [
      { id: 6, name: 'Dr. Howard Zinn', rating: 4.4, reviews: ["Offers a unique perspective on history.", "The reading list is heavy but worth it."] },
      { id: 7, name: 'Ms. Mary Beard', rating: 4.9, reviews: ["Brings ancient Rome to life!", "Incredibly knowledgeable and engaging.", "Her storytelling is top-notch."] },
    ],
  },
  {
    name: 'Literature',
    icon: BookOpen,
    teachers: [
      { id: 8, name: 'Mr. William Shakespeare', rating: 4.2, reviews: ["A bit dramatic, but knows his stuff.", "Challenging but rewarding class."] },
      { id: 9, name: 'Ms. Virginia Woolf', rating: 4.8, reviews: ["Deep thinker and fantastic discussion leader.", "Opened my eyes to new ways of reading."] },
      { id: 10, name: 'Prof. Toni Morrison', rating: 4.9, reviews: ["A true master of the craft.", "I'll never forget the lessons learned in her class.", "She is a legend."] },
    ],
  },
  {
    name: 'Art',
    icon: Palette,
    teachers: [
      { id: 11, name: 'Mr. Leonardo da Vinci', rating: 4.9, reviews: ["A true Renaissance man. Teaches more than just painting.", "His attention to detail is inspiring."] },
      { id: 12, name: 'Ms. Frida Kahlo', rating: 4.7, reviews: ["Encourages us to find our own voice.", "Very passionate and expressive."] },
    ],
  },
];
// ============================================================================
// END OF DATABASE CONFIGURATION
// ============================================================================


export default function Home() {
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

        <div className="space-y-16">
          {subjectsData.map((subject) => (
            <SubjectSection key={subject.name} subject={subject} />
          ))}
        </div>
      </div>
    </main>
  );
}
