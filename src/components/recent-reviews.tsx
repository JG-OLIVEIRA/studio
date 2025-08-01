'use client';

import { useState, useTransition } from 'react';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Quote, User, Book } from 'lucide-react';
import StarRating from './star-rating';
import { upvoteReview, downvoteReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface RecentReviewsProps {
  initialReviews: Review[];
}

export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleVote = (reviewId: number, voteType: 'up' | 'down') => {
    startTransition(async () => {
      try {
        const action = voteType === 'up' ? upvoteReview : downvoteReview;
        await action(reviewId);

        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              return {
                ...review,
                upvotes: voteType === 'up' ? review.upvotes + 1 : review.upvotes,
                downvotes: voteType === 'down' ? review.downvotes + 1 : review.downvotes,
              };
            }
            return review;
          })
        );

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar voto',
          description: errorMessage,
        });
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "agora mesmo";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "ontem";
    return `há ${diffInDays} dias`;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {reviews.map(review => (
        <Card key={review.id} className="bg-card/50 shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <StarRating rating={review.rating} />
              <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {review.text && (
                 <blockquote className="relative p-4 text-sm border-l-4 border-primary/50 bg-background rounded-r-lg">
                    <Quote className="absolute -top-2 -left-3 h-5 w-5 text-primary/50" />
                    {review.text}
                </blockquote>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4 pt-3">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className='flex items-center gap-4 flex-wrap'>
                    <div className="flex items-center gap-1.5" title={`Professor(a) ${review.teacherName}`}>
                        <User className="h-4 w-4" />
                        <span className="font-medium truncate">{review.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`Matéria ${review.subjectName}`}>
                        <Book className="h-4 w-4" />
                        <span className="font-medium truncate">{review.subjectName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleVote(review.id, 'up')}
                            disabled={isPending}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium w-4 text-center">{review.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleVote(review.id, 'down')}
                            disabled={isPending}
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium w-4 text-center">{review.downvotes}</span>
                    </div>
                </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
