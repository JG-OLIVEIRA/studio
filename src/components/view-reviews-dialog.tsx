
"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import type { Teacher } from '@/lib/types';
import StarRating from './star-rating';
import { ScrollArea } from './ui/scroll-area';
  
interface ViewReviewsDialogProps {
    teacher: Teacher;
    children: React.ReactNode;
    disabled: boolean;
}

export function ViewReviewsDialog({ teacher, children, disabled }: ViewReviewsDialogProps) {
    if (disabled) {
        return <div className="w-full">{children}</div>;
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
                        Veja o que os outros alunos estão dizendo.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {teacher.reviews.map((review) => (
                            <div key={review.id} className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center justify-between mb-2">
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-sm text-foreground">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
