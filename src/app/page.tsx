import { GraduationCap, PlusCircle } from 'lucide-react';
import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';

export default async function Home() {
  // Fetch data on the server before rendering the page.
  const subjectsData = await getSubjectsData();

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
        
        {/* All client-side interactions are now handled in this component */}
        <TeacherRateClient initialSubjectsData={subjectsData} />

      </div>
    </main>
  );
}
