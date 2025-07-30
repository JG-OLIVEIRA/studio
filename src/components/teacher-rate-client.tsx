
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

const flowchartData = [
    { semester: 1, subjects: ["Geometria Analítica", "Cálculo I", "Álgebra", "Matemática Discreta", "Fundamentos da Computação"] },
    { semester: 2, subjects: ["Álgebra Linear", "Cálculo II", "Cálculo das Probabilidades", "Algoritmos e Est. de Dados I", "Linguagem de Programação I", "Física I"] },
    { semester: 3, subjects: ["Português Instrumental", "Cálculo III", "Algoritmos e Est. de Dados II", "Elementos de Lógica", "Linguagem de Programação II", "Teoria da Computação"] },
    { semester: 4, subjects: ["Cálculo Numérico", "Cálculo IV", "Algoritmos em Grafos", "Engenharia de Software", "Arquitetura de Computadores I", "Física II"] },
    { semester: 5, subjects: ["Estruturas de Linguagens", "Banco de Dados I", "Otimização em Grafos", "Análise e Proj. de Sistemas", "Sistemas Operacionais I", "Arquitetura de Computadores II", "Eletiva Básica"] },
    { semester: 6, subjects: ["Otimização Combinatória", "Banco de Dados II", "Interfaces Humano-Comp.", "Eletiva I", "Sistemas Operacionais II", "Compiladores"] },
    { semester: 7, subjects: ["Computação Gráfica", "Inteligência Artificial", "Ética Comp. e Sociedade", "Metod. Cient. no Projeto Final", "Redes de Computadores I", "Arq. Avançadas de Computadores"] },
    { semester: 8, subjects: ["Eletiva II", "Eletiva III", "Projeto Final", "Sistemas Distribuídos", "Eletiva IV"] },
];

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
    reviewText: string;
    reviewRating: number;
  }) => {
    // We call the server action to add the data to the DB.
    // revalidatePath('/') in the action will trigger a data refetch on the server.
    await handleAddTeacherOrReview(data);
    
    // After adding, just close the dialog.
    setIsDialogOpen(false);
  };

  const handleSubjectClick = (subjectName: string) => {
    // Find subject ID by name
    const subject = initialSubjectsData.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    if (subject) {
      const element = document.getElementById(`subject-title-${subject.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const filteredSemesters = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return flowchartData.map(semester => {
        const subjectsInSemester = initialSubjectsData.filter(dbSub => 
            semester.subjects.some(flowSub => flowSub.toLowerCase() === dbSub.name.toLowerCase())
        );

        let filteredSubjectsInSemester = subjectsInSemester;

        if (searchQuery) {
            filteredSubjectsInSemester = subjectsInSemester.map(subject => {
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
        }
        
        return {
            ...semester,
            subjects: filteredSubjectsInSemester,
        };
    }).filter(semester => semester.subjects.length > 0);
  }, [initialSubjectsData, searchQuery]);

  const subjectsWithoutSemester = useMemo(() => {
     if (searchQuery) return []; // Don't show "extras" when searching
     const allSemesterSubjects = new Set(flowchartData.flatMap(s => s.subjects.map(sub => sub.toLowerCase())));
     return initialSubjectsData.filter(s => !allSemesterSubjects.has(s.name.toLowerCase()));
  }, [initialSubjectsData, searchQuery]);

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

      <div className="space-y-12">
        {filteredSemesters.length > 0 ? (
          filteredSemesters.map((semester) => (
            <div key={semester.semester}>
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">{semester.semester}º Período</h2>
              <div className="space-y-10">
                {semester.subjects.map((subject) => (
                  <SubjectSection key={subject.id} subject={subject} />
                ))}
              </div>
            </div>
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
        
        {subjectsWithoutSemester.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">Outras Disciplinas</h2>
              <div className="space-y-10">
                {subjectsWithoutSemester.map((subject) => (
                  <SubjectSection key={subject.id} subject={subject} />
                ))}
              </div>
            </div>
        )}
      </div>
    </>
  );
}
