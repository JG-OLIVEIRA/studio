
'use client';

import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import StarRating from './star-rating';
import { Badge } from './ui/badge';
import { MessageSquare, Sparkles, Trophy } from 'lucide-react';
import AIReviewInsights from './ai-review-insights';
import { Button } from './ui/button';

interface TeacherListItemProps {
  teacher: Teacher;
  rank: number;
}

export default function TeacherListItem({ teacher, rank }: TeacherListItemProps) {
  const { name, averageRating = 0, reviews, subjects } = teacher;
  const hasReviews = reviews.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-primary w-8 text-center">{rank}</span>
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        </div>
        <div className='flex items-center gap-2'>
            {rank === 1 && <Trophy className="h-6 w-6 text-amber-400" />}
             <AIReviewInsights teacher={teacher} disabled={!hasReviews}>
                <Button variant="ghost" size="icon" disabled={!hasReviews} aria-label="Ver análise de IA">
                    <Sparkles className="h-5 w-5" />
                </Button>
            </AIReviewInsights>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center flex-grow">
        <div className="flex flex-col items-center md:items-start space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Média Global</h4>
            <div className="flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
        </div>
        <div className="col-span-2">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center md:text-left">Matérias Lecionadas</h4>
            {subjects && subjects.size > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {Array.from(subjects).map((subjectName) => (
                        <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                    ))}
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground text-center md:text-left">Nenhuma matéria registrada.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
