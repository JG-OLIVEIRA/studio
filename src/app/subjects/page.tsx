

import { BookOpen, ArrowLeft } from 'lucide-react';
import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MainLayout from '@/components/main-layout';

export default async function SubjectsPage() {
  const subjectsData = await getSubjectsData();

  const headerContent = (
    <div className="flex items-center justify-end w-full">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Professores
        </Link>
    </div>
  );

  return (
    <MainLayout headerProps={{
        pageTitle: 'Visualização por Matéria',
        pageIconName: 'BookOpen',
        children: headerContent
    }}>
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <TeacherRateClient initialSubjectsData={subjectsData} />
            
            <footer className="text-center mt-16 pb-8">
                <p className="text-sm text-muted-foreground">
                    Desenvolvido por Jorge Oliveira com a ajuda da IA do Firebase.
                </p>
            </footer>
        </div>
    </MainLayout>
  );
}
