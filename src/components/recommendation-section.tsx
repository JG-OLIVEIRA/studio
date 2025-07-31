
'use client';

import { useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb, Star } from 'lucide-react';
import { Badge } from './ui/badge';

interface RecommendationSectionProps {
  allSubjects: Subject[];
  completedSubjects: string[];
}

export default function RecommendationSection({ allSubjects, completedSubjects }: RecommendationSectionProps) {

  const recommendations = useMemo(() => {
    if (completedSubjects.length === 0) return [];

    const completedSet = new Set(completedSubjects);
    // Find all subjects that haven't been completed yet.
    const futureSubjects = allSubjects.filter(s => !completedSet.has(s.name));
    
    const suggestions: { subjectName: string, teacher: Teacher }[] = [];

    futureSubjects.forEach(subject => {
        // Ensure the subject has teachers associated with it.
        if(subject.teachers.length > 0) {
            // Find the top-rated teacher for this subject.
            const topTeacher = [...subject.teachers].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];
            // Only suggest teachers who have at least one review.
            if(topTeacher && (topTeacher.averageRating ?? 0) > 0) {
                suggestions.push({ subjectName: subject.name, teacher: topTeacher });
            }
        }
    });

    // Sort all suggestions by the teacher's rating, showing the best of the best first.
    return suggestions.sort((a,b) => (b.teacher.averageRating ?? 0) - (a.teacher.averageRating ?? 0)).slice(0, 5); // Limit to top 5 suggestions

  }, [completedSubjects, allSubjects]);
  
  if (completedSubjects.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-primary" />
            Próximas Matérias & Professores Sugeridos
        </CardTitle>
        <CardDescription>
            Com base nas matérias que você cursou, aqui estão algumas sugestões para o seu próximo período.
        </CardDescription>
      </CardHeader>
        <CardContent>
            {recommendations.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {recommendations.map(({ subjectName, teacher }) => (
                         <div key={subjectName} className="p-3 border rounded-lg bg-background text-center shadow-sm hover:border-primary transition-colors">
                            <p className="text-sm font-semibold truncate" title={subjectName}>{subjectName}</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">
                                Sugestão: <span className="text-primary font-medium">Prof. {teacher.name}</span>
                            </p>
                            <Badge variant="outline">
                                <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                                {teacher.averageRating?.toFixed(1)} de Média
                            </Badge>
                        </div>
                    ))}
                 </div>
            ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                    Parabéns, parece que você já cursou todas as matérias com professores avaliados ou não há sugestões no momento!
                </p>
            )}
        </CardContent>
    </Card>
  );
}
