'use client';

import { useState, useMemo } from 'react';
import { Sparkles, MessageSquarePlus } from 'lucide-react';
import type { Teacher, Review } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './star-rating';
import AIReviewInsights from './ai-review-insights';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { AddReviewForm } from './add-review-form';

interface TeacherCardProps {
  teacher: Teacher;
}

export default function TeacherCard({ teacher: initialTeacher }: TeacherCardProps) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const averageRating = useMemo(() => {
    if (teacher.reviews.length === 0) return 0;
    const total = teacher.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / teacher.reviews.length;
  }, [teacher.reviews]);

  const handleAddReview = (data: { author: string; text: string; rating: number }) => {
    const newReview: Review = {
      id: Date.now(), // simple unique id
      ...data,
    };
    setTeacher(prev => ({
        ...prev,
        reviews: [...prev.reviews, newReview]
    }));
    setIsReviewOpen(false);
  }

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} />
          <span className="text-sm font-bold text-muted-foreground">{averageRating.toFixed(1)}</span>
        </div>
         <p className="text-sm text-muted-foreground mt-2">{teacher.reviews.length} reviews</p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <AIReviewInsights teacher={teacher}>
          <Button variant="secondary" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </AIReviewInsights>
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <Button onClick={() => setIsReviewOpen(true)} className="w-full">
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Add Review
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a review for {teacher.name}</DialogTitle>
                    <DialogDescription>
                        Share your experience to help others.
                    </DialogDescription>
                </DialogHeader>
                <AddReviewForm 
                    onSubmit={handleAddReview} 
                    onClose={() => setIsReviewOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
