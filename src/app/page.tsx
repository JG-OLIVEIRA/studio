
import { GraduationCap } from 'lucide-react';
import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';

export default async function Home() {
  // Fetch data on the server before rendering the page.
  const subjectsData = await getSubjectsData();

  return (
    <main className="min-h-screen w-full bg-background font-sans text-foreground">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              CcompTeacherRate
            </h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra os melhores professores de Ciência da Computação, avaliados por alunos como você.
          </p>
        </header>

        {/* All client-side interactions are now handled in this component */}
        <TeacherRateClient initialSubjectsData={subjectsData} />
        
        <footer className="text-center mt-16 pb-8">
            <p className="text-sm text-muted-foreground">
                Desenvolvido por Jorge Oliveira com a ajuda da IA do Firebase.
            </p>
        </footer>

      </div>
    </main>
  );
}
