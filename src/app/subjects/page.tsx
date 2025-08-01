

import { getSubjectsData } from '@/app/actions';
import TeacherRateClient from '@/components/teacher-rate-client';
import MainLayout from '@/components/main-layout';
import SubjectsHeaderActions from '@/components/subjects-header-actions';

export default async function SubjectsPage() {
  const subjectsData = await getSubjectsData();

  const headerContent = (
    <div className="flex flex-col items-center justify-center text-center w-full">
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            O lugar central para encontrar e avaliar os professores de Ciência da Computação.
        </p>
        <SubjectsHeaderActions />
    </div>
  );

  return (
    <MainLayout headerProps={{
        pageTitle: 'CcompTeacherRate',
        pageIconName: 'GraduationCap',
        children: headerContent
    }}>
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <TeacherRateClient initialSubjectsData={subjectsData} />
            
            <footer className="text-center mt-16 pb-8">
                <p className="text-sm text-muted-foreground">
                    Desenvolvido com a ajuda da IA do Firebase.
                </p>
            </footer>
        </div>
    </MainLayout>
  );
}
