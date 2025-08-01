'use client';

import { useState, useMemo, Fragment } from 'react';
import { Search } from 'lucide-react';
import type { Subject } from '@/lib/types';
import SubjectSection from '@/components/subject-section';
import { Input } from '@/components/ui/input';
import CourseFlowchart from './course-flowchart';
import { Accordion } from '@/components/ui/accordion';
import RecommendationSection from './recommendation-section';

interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
}

const flowchartData: { semester: number, subjects: string[] }[] = [
    { semester: 1, subjects: ["Geometria Analítica", "Cálculo I", "Álgebra", "Matemática Discreta", "Fundamentos da Computação"] },
    { semester: 2, subjects: ["Álgebra Linear", "Cálculo II", "Cálculo das Probabilidades", "Algoritmos e Est. de Dados I", "Linguagem de Programação I", "Física I"] },
    { semester: 3, subjects: ["Português Instrumental", "Cálculo III", "Algoritmos e Est. de Dados II", "Elementos de Lógica", "Linguagem de Programação II", "Teoria da Computação"] },
    { semester: 4, subjects: ["Cálculo Numérico", "Cálculo IV", "Algoritmos em Grafos", "Engenharia de Software", "Arquitetura de Computadores I", "Física II"] },
    { semester: 5, subjects: ["Estruturas de Linguagens", "Banco de Dados I", "Otimização em Grafos", "Análise e Proj. de Sistemas", "Sistemas Operacionais I", "Arquitetura de Computadores II", "Eletiva Básica"] },
    { semester: 6, subjects: ["Otimização Combinatória", "Banco de Dados II", "Interfaces Humano-Comp.", "Eletiva I", "Sistemas Operacionais II", "Compiladores"] },
    { semester: 7, subjects: ["Computação Gráfica", "Inteligência Artificial", "Ética Comp. e Sociedade", "Metod. Cient. no Projeto Final", "Redes de Computadores I", "Arq. Avançadas de Computadores"] },
    { semester: 8, subjects: ["Eletiva II", "Eletiva III", "Projeto Final", "Sistemas Distribuídos", "Eletiva IV"] },
];

// Helper to find the semester for a subject
const getSemesterForSubject = (subjectName: string): number | null => {
    for (const semesterData of flowchartData) {
        if (semesterData.subjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
            return semesterData.semester;
        }
    }
    return 99; // Or a default semester like 99 for electives/uncategorized
};

export default function TeacherRateClient({ initialSubjectsData }: TeacherRateClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([]);

  const filteredAndGroupedSubjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    let subjectsToProcess = initialSubjectsData;

    if (searchQuery) {
        subjectsToProcess = initialSubjectsData.filter(subject => 
            subject.name.toLowerCase().includes(lowercasedQuery)
        );
    }

    const grouped: Record<number, Subject[]> = {};
    subjectsToProcess.forEach(subject => {
        const semester = getSemesterForSubject(subject.name) ?? 99; // 99 for "Outros"
        if (!grouped[semester]) {
            grouped[semester] = [];
        }
        grouped[semester].push(subject);
    });

    // Sort subjects within each group alphabetically
    for (const semester in grouped) {
        grouped[semester].sort((a, b) => a.name.localeCompare(b.name));
    }

    return Object.entries(grouped).sort(([semA], [semB]) => parseInt(semA) - parseInt(semB));

  }, [initialSubjectsData, searchQuery]);

  
  const defaultAccordionValues = useMemo(() => {
    if (searchQuery) {
      // Expand all items when searching
      return filteredAndGroupedSubjects.flatMap(([, subjects]) => subjects.map(sub => `subject-${sub.id}`));
    }
    return openAccordionItems;
  }, [searchQuery, filteredAndGroupedSubjects, openAccordionItems]);


  const noResults = filteredAndGroupedSubjects.length === 0;

  return (
    <>
      <CourseFlowchart onCompletedChange={setCompletedSubjects} />
      <RecommendationSection allSubjects={initialSubjectsData} completedSubjects={completedSubjects} />
      
      <div className="my-8 max-w-lg mx-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Pesquisar por disciplina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
            />
        </div>
      </div>

      <div className="space-y-6">
        {noResults ? (
             <div className="text-center text-muted-foreground py-12">
                {initialSubjectsData.length > 0 ? (
                    <>
                        <p className="font-semibold text-lg">Nenhum resultado encontrado para "{searchQuery}".</p>
                        <p className="mt-2 text-sm">Tente um termo de busca diferente.</p>
                    </>
                ) : (
                    <>
                        <p className="font-semibold text-lg">Nenhuma matéria cadastrada ainda.</p>
                        <p className="mt-2 text-sm">Aguarde, as matérias estão sendo carregadas...</p>
                    </>
                )}
            </div>
        ) : (
            filteredAndGroupedSubjects.map(([semester, subjects]) => (
                <Fragment key={semester}>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground border-b pb-2">
                        {parseInt(semester) > 8 ? 'Matérias não categorizadas' : `${semester}º Período`}
                    </h2>
                    <Accordion 
                        type="multiple" 
                        value={defaultAccordionValues}
                        onValueChange={setOpenAccordionItems}
                        className="space-y-2"
                    >
                        {subjects.map((subject) => (
                            <SubjectSection key={subject.id} subject={subject} />
                        ))}
                    </Accordion>
                </Fragment>
            ))
        )}
      </div>
    </>
  );
}
