
"use client"

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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

import type { Teacher } from '@/lib/types';
import StarRating from './star-rating';
import { ScrollArea } from './ui/scroll-area';
import { Button, buttonVariants } from './ui/button';
import { ThumbsUp, ThumbsDown, Flag, ShieldAlert } from 'lucide-react';
import { upvoteReview, downvoteReview, reportReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';


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

    const handleReport = (reviewId: number) => {
        startTransition(async () => {
            try {
                await reportReview(reviewId);
                toast({
                    title: "Avaliação denunciada",
                    description: "Obrigado. Nossa equipe irá analisar a sua denúncia.",
                });
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
                toast({
                    variant: "destructive",
                    title: "Erro ao denunciar",
                    description: errorMessage,
                });
            }
        })
    }

    const reviewsWithText = teacher.reviews.filter(review => review.text && review.text.trim() !== '');
    const sortedReviews = [...reviewsWithText].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Data inválida";
            }
            return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
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
                            <div key={review.id} className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex justify-between items-start mb-2">
                                    <StarRating rating={review.rating} />
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                disabled={isPending}
                                                aria-label="Denunciar avaliação"
                                            >
                                                <Flag className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2">
                                                    <ShieldAlert className="h-6 w-6 text-destructive"/>
                                                    Denunciar esta avaliação?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. A avaliação será ocultada e revisada. Se receber múltiplas denúncias, será permanentemente excluída. Por favor, denuncie apenas conteúdo que viole as regras (ex: discurso de ódio, ataques pessoais, spam).
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    className={cn(buttonVariants({variant: "destructive"}))}
                                                    onClick={() => handleReport(review.id)}>
                                                    Confirmar Denúncia
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <p className="text-sm text-foreground mb-3">{review.text}</p>
                                <div className="flex items-center justify-between">
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
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                <p className="font-semibold">Nenhuma avaliação com texto.</p>
                                <p className="text-sm">Ainda não há comentários escritos para este professor.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
