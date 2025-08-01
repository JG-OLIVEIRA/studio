
'use client';

import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import StarRating from './star-rating';
import { Badge } from './ui/badge';
import { MessageSquare, Sparkles, Eye } from 'lucide-react';
import AIReviewInsights from './ai-review-insights';
import { Button } from './ui/button';
import { ViewReviewsDialog } from './view-reviews-dialog';
import { Separator } from './ui/separator';

interface TeacherListItemProps {
  teacher: Teacher;
  rank: number;
}

export default function TeacherListItem({ teacher, rank }: TeacherListItemProps) {
  const { name, averageRating = 0, reviews, subjects } = teacher;
  const hasReviews = reviews.length > 0;

  // Since we are on the main page, the "subject" for AI context can be generic
  // or you can decide on a primary subject if that data is available.
  // Here we'll just pass the teacher object which now contains all reviews.
  const teacherForAI = { ...teacher, subject: 'Geral' };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-primary w-8 text-center">{rank}</span>
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        </div>
        <div className='flex items-center gap-1'>
             <AIReviewInsights teacher={teacherForAI} disabled={!hasReviews}>
                <Button variant="ghost" size="icon" disabled={!hasReviews} aria-label="Ver análise de IA">
                    <Sparkles className="h-5 w-5" />
                </Button>
            </AIReviewInsights>
            <ViewReviewsDialog teacher={teacher} disabled={!hasReviews}>
                <Button variant="ghost" size="icon" disabled={!hasReviews} aria-label="Ver avaliações">
                    <Eye className="h-5 w-5" />
                </Button>
            </ViewReviewsDialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 space-y-2 sm:space-y-0">
            <div className="flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
        </div>
        
        <Separator />
        
        <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Matérias Lecionadas</h4>
            {subjects && subjects.size > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from(subjects).sort().map((subjectName) => (
                        <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                    ))}
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground">Nenhuma matéria registrada.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
