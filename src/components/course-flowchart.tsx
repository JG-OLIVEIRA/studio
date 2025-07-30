
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import FlowchartSubjectCard from "./flowchart-subject-card";

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

interface CourseFlowchartProps {
  onSubjectClick: (subjectName: string) => void;
}

export default function CourseFlowchart({ onSubjectClick }: CourseFlowchartProps) {
  return (
    <Card className="w-full mt-12">
      <CardHeader>
        <CardTitle>Fluxograma Interativo do Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {flowchartData.map(({ semester, subjects }) => (
              <div key={semester} className="flex flex-col items-center space-y-4">
                <h3 className="font-bold text-lg sticky top-0 bg-background z-10 px-2 py-1 rounded">{semester}º Período</h3>
                <div className="flex flex-col space-y-2">
                  {subjects.map((subject) => (
                    <FlowchartSubjectCard key={subject} subjectName={subject} onClick={() => onSubjectClick(subject)} />
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
