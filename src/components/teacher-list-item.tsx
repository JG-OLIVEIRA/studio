
'use client';

import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import StarRating from './star-rating';
import { Badge } from './ui/badge';
import { MessageSquare, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { ViewReviewsDialog } from './view-reviews-dialog';

interface TeacherListItemProps {
  teacher: Teacher;
}

export default function TeacherListItem({ teacher }: TeacherListItemProps) {
  const { name, averageRating = 0, reviews, subjects } = teacher;
  const hasReviews = reviews.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center gap-3 pt-2">
        <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="font-bold text-sm text-muted-foreground">{averageRating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
        </div>
      </CardContent>
       <CardFooter className="flex-col items-start gap-4 pt-4">
         <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Matérias Lecionadas</h4>
            {subjects && subjects.size > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {Array.from(subjects).sort().map((subjectName) => (
                        <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                    ))}
                </div>
            ) : (
                 <p className="text-xs text-muted-foreground">Nenhuma matéria registrada.</p>
            )}
        </div>
        <ViewReviewsDialog teacher={teacher} disabled={!hasReviews}>
            <Button variant="outline" className="w-full" disabled={!hasReviews}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Avaliações
            </Button>
        </ViewReviewsDialog>
      </CardFooter>
    </Card>
  );
}
