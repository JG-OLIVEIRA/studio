
import { GraduationCap, BookOpen } from 'lucide-react';
import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default async function SubjectsPage() {
  // Fetch data on the server before rendering the page.
  const subjectsData = await getSubjectsData();

  return (
    <main className="min-h-screen w-full bg-background font-sans text-foreground">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8 pb-4 border-b">
            <div className='flex items-center gap-4'>
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">
                    Visualização por Matéria
                </h1>
            </div>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Professores
            </Link>
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
