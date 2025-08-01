
'use client';

import { useState } from 'react';
import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import StarRating from './star-rating';
import { Badge } from './ui/badge';
import { MessageSquare, Eye, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { ViewReviewsDialog } from './view-reviews-dialog';
import { AddTeacherOrReviewDialog } from './add-teacher-or-review-dialog';
import { cn } from '@/lib/utils';

interface TeacherListItemProps {
  teacher: Teacher;
  allSubjectNames: string[];
  allTeachers: Teacher[];
  onSubmit: (data: any) => Promise<void>;
}

export default function TeacherListItem({ teacher, allSubjectNames, allTeachers, onSubmit }: TeacherListItemProps) {
  const { name, averageRating = 0, reviews, subjects } = teacher;
  const hasReviews = reviews.length > 0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is a button or inside a button to prevent dialog opening
    if (e.target instanceof Element && e.target.closest('button')) {
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <AddTeacherOrReviewDialog
      allSubjectNames={allSubjectNames}
      allTeachers={allTeachers}
      onSubmit={onSubmit}
      triggerElement={
        <Card 
            className={cn(
                "hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer",
                "border-2 border-transparent hover:border-primary"
            )}
            onClick={handleCardClick}
        >
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
      }
      initialTeacherName={teacher.name}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
  );
}
