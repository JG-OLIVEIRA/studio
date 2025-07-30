
'use client';

import { useState, useMemo } from 'react';
import { Sparkles, MessageSquarePlus, Eye, Trophy } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './star-rating';
import AIReviewInsights from './ai-review-insights';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { AddReviewForm } from './add-review-form';
import { ViewReviewsDialog } from './view-reviews-dialog';

interface TeacherCardProps {
  teacher: Teacher;
  isTopTeacher?: boolean;
}

export default function TeacherCard({ teacher, isTopTeacher = false }: TeacherCardProps) {
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  const averageRating = useMemo(() => {
    if (teacher.reviews.length === 0) return 0;
    const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / teacher.reviews.length;
  }, [teacher.reviews]);
  
  const hasReviews = teacher.reviews.length > 0;

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        isTopTeacher && 'border-primary border-2 shadow-primary/20'
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
        {isTopTeacher && <Trophy className="h-6 w-6 text-amber-400" />}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} />
          {hasReviews && <span className="text-sm font-bold text-muted-foreground">{averageRating.toFixed(1)}</span>}
        </div>
         <p className="text-sm text-muted-foreground mt-2">
          {hasReviews ? `${teacher.reviews.length} avaliações` : "Nenhuma avaliação ainda"}
        </p>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <AIReviewInsights teacher={teacher} disabled={!hasReviews}>
          <Button variant="secondary" className="w-full" disabled={!hasReviews}>
            <Sparkles className="mr-2 h-4 w-4" />
            IA
          </Button>
        </AIReviewInsights>
        
        <ViewReviewsDialog teacher={teacher} disabled={!hasReviews}>
            <Button variant="secondary" className="w-full" disabled={!hasReviews}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
            </Button>
        </ViewReviewsDialog>

        <AddReviewForm 
          teacher={teacher}
          open={isAddReviewOpen}
          onOpenChange={setIsAddReviewOpen}
        >
          <Button onClick={() => setIsAddReviewOpen(true)} className="w-full col-span-2">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Adicionar Avaliação
          </Button>
        </AddReviewForm>
      </CardFooter>
    </Card>
  );
}
