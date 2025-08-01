
'use client';

import { Eye, Trophy } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './star-rating';
import { Button } from './ui/button';
import { ViewReviewsDialog } from './view-reviews-dialog';

interface TeacherCardProps {
  teacher: Teacher;
  isTopTeacher?: boolean;
}

export default function TeacherCard({ teacher, isTopTeacher = false }: TeacherCardProps) {
  const averageRating = teacher.averageRating ?? 0;
  const hasReviews = teacher.reviews.length > 0;

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card',
        isTopTeacher && 'border-primary border-2 shadow-primary/20'
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
        {isTopTeacher && <Trophy className="h-6 w-6 text-amber-400" />}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
            {hasReviews ? (
                <>
                    <StarRating rating={averageRating} />
                    <span className="text-sm font-bold text-muted-foreground">{averageRating.toFixed(1)}</span>
                </>
            ) : (
                 <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda</p>
            )}
        </div>
         <p className="text-sm text-muted-foreground mt-2">
          {hasReviews ? `${teacher.reviews.length} ${teacher.reviews.length === 1 ? 'avaliação' : 'avaliações'}` : ""}
        </p>
      </CardContent>
      <CardFooter className="pt-4">
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
