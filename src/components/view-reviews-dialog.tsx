
"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Teacher, Review } from '@/lib/types';
import StarRating from './star-rating';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { upvoteReview, downvoteReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
  
interface ViewReviewsDialogProps {
    teacher: Teacher;
    children: React.ReactNode;
    disabled: boolean;
}

export function ViewReviewsDialog({ teacher, children, disabled }: ViewReviewsDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    if (disabled) {
        return <div className="w-full">{children}</div>;
    }
    
    const handleVote = (reviewId: number, voteType: 'up' | 'down') => {
        startTransition(async () => {
            try {
                if (voteType === 'up') {
                    await upvoteReview(reviewId);
                } else {
                    await downvoteReview(reviewId);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
                toast({
                    variant: "destructive",
                    title: "Erro ao votar",
                    description: errorMessage,
                });
            }
        });
    };

    const sortedReviews = [...teacher.reviews].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            // Verifica se a data é válida
            if (isNaN(date.getTime())) {
                return "Data inválida";
            }
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return "Data inválida";
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Avaliações para {teacher.name}</DialogTitle>
                    <DialogDescription>
                        Veja o que os outros alunos estão dizendo. As avaliações mais relevantes aparecem primeiro.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {sortedReviews.length > 0 ? sortedReviews.map((review) => (
                            <div key={review.id} className="group p-4 border rounded-lg bg-muted/50 relative">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-foreground mb-3">{review.text}</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7"
                                            onClick={() => handleVote(review.id, 'up')}
                                            disabled={isPending}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-medium text-muted-foreground w-4">{review.upvotes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7"
                                            onClick={() => handleVote(review.id, 'down')}
                                            disabled={isPending}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-medium text-muted-foreground w-4">{review.downvotes}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">Nenhuma avaliação encontrada.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
