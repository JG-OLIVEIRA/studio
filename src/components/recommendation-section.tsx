
'use client';

import { useState, useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { MultiSelect } from './ui/multi-select';
import { Lightbulb, Star } from 'lucide-react';
import { Badge } from './ui/badge';

interface RecommendationSectionProps {
  allSubjects: Subject[];
}

export default function RecommendationSection({ allSubjects }: RecommendationSectionProps) {
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([]);

  const subjectOptions = useMemo(() => {
    return allSubjects.map(s => ({ value: s.name, label: s.name })).sort((a,b) => a.label.localeCompare(b.label));
  }, [allSubjects]);

  const recommendations = useMemo(() => {
    if (completedSubjects.length === 0) return [];

    const completedSet = new Set(completedSubjects);
    const futureSubjects = allSubjects.filter(s => !completedSet.has(s.name));
    
    const suggestions: { subjectName: string, teacher: Teacher }[] = [];

    futureSubjects.forEach(subject => {
        if(subject.teachers.length > 0) {
            const topTeacher = [...subject.teachers].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];
            if(topTeacher && (topTeacher.averageRating ?? 0) > 0) {
                suggestions.push({ subjectName: subject.name, teacher: topTeacher });
            }
        }
    });

    // Sort suggestions by best teacher rating
    return suggestions.sort((a,b) => (b.teacher.averageRating ?? 0) - (a.teacher.averageRating ?? 0)).slice(0, 5); // Limit to top 5 suggestions

  }, [completedSubjects, allSubjects]);

  return (
    <Card className="mb-12 bg-secondary/50 border-primary/20">
      <CardHeader>
        <div className='flex items-start justify-between'>
            <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    Planeje seu Semestre
                </CardTitle>
                <CardDescription className="mt-2">
                    Selecione as matérias que você já cursou para receber sugestões de professores para as próximas.
                </CardDescription>
            </div>
            <MultiSelect
                options={subjectOptions}
                selected={completedSubjects}
                onChange={setCompletedSubjects}
                placeholder="Selecione as matérias cursadas..."
                className="max-w-xs"
            />
        </div>
      </CardHeader>
      {completedSubjects.length > 0 && (
        <CardContent>
            {recommendations.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {recommendations.map(({ subjectName, teacher }) => (
                         <div key={subjectName} className="p-3 border rounded-lg bg-background text-center shadow-sm">
                            <p className="text-sm font-semibold truncate">{subjectName}</p>
                            <p className="text-xs text-primary mt-1 mb-2">Considere o(a) Prof(a). {teacher.name.split(' ')[0]}</p>
                            <Badge variant="outline">
                                <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                                {teacher.averageRating?.toFixed(1)}
                            </Badge>
                        </div>
                    ))}
                 </div>
            ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                    Parabéns, parece que você já cursou todas as matérias com professores avaliados!
                </p>
            )}
        </CardContent>
      )}
    </Card>
  );
}
