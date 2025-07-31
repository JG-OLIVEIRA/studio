
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import FlowchartSubjectCard from "./flowchart-subject-card";
import { Lightbulb, MousePointerClick } from 'lucide-react';

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

const LOCAL_STORAGE_KEY = 'completedSubjects';

interface CourseFlowchartProps {
  onSubjectClick: (subjectName: string) => void;
}

export default function CourseFlowchart({ onSubjectClick }: CourseFlowchartProps) {
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedCompleted = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedCompleted) {
        setCompletedSubjects(new Set(JSON.parse(storedCompleted)));
      }
    } catch (error) {
      console.error("Failed to parse completed subjects from localStorage", error);
    }
  }, []);

  const handleToggleSubject = (subjectName: string) => {
    const newCompletedSubjects = new Set(completedSubjects);
    if (newCompletedSubjects.has(subjectName)) {
      newCompletedSubjects.delete(subjectName);
    } else {
      newCompletedSubjects.add(subjectName);
    }
    setCompletedSubjects(newCompletedSubjects);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newCompletedSubjects)));
    } catch (error) {
       console.error("Failed to save completed subjects to localStorage", error);
    }

    onSubjectClick(subjectName);
  };

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return null;
  }

  return (
    <Card className="w-full mb-12 bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-primary" />
            Fluxograma Interativo do Curso
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
            <MousePointerClick className='h-4 w-4'/>
            Clique nas matérias que você já cursou para marcá-las. A página rolará até a matéria clicada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-background">
          <div className="flex w-max space-x-4 p-4">
            {flowchartData.map(({ semester, subjects }) => (
              <div key={semester} className="flex flex-col items-center space-y-4">
                <h3 className="font-bold text-lg sticky top-0 bg-background z-10 px-2 py-1 rounded">{semester}º Período</h3>
                <div className="flex flex-col space-y-2">
                  {subjects.map((subject) => (
                    <FlowchartSubjectCard 
                        key={subject} 
                        subjectName={subject}
                        isCompleted={completedSubjects.has(subject)}
                        onClick={() => handleToggleSubject(subject)} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
