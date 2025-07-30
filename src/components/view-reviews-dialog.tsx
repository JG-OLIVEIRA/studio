
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
import { Trash2 } from 'lucide-react';
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
import { deleteReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
  
interface ViewReviewsDialogProps {
    teacher: Teacher;
    children: React.ReactNode;
    disabled: boolean;
}

export function ViewReviewsDialog({ teacher, children, disabled }: ViewReviewsDialogProps) {
    const { toast } = useToast();

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

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Avaliações para {teacher.name}</DialogTitle>
                    <DialogDescription>
                        Veja o que os outros alunos estão dizendo.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {teacher.reviews.length > 0 ? teacher.reviews.map((review) => (
                            <div key={review.id} className="group p-4 border rounded-lg bg-muted/50 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <StarRating rating={review.rating} />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                <p className="text-sm text-foreground pr-8">{review.text}</p>
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
