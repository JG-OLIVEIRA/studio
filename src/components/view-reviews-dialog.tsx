
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
import { Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteReview, upvoteReview, downvoteReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
  
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

    const handleDelete = async (reviewId: number) => {
        try {
            await deleteReview(reviewId);
            toast({
                title: "Sucesso!",
                description: "A avaliação foi removida.",
            });
        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            toast({
                variant: "destructive",
                title: "Erro ao remover",
                description: errorMessage,
            });
        }
    };
    
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
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a avaliação.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(review.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
