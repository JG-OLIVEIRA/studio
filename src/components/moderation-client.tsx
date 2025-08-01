
'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, User, Tag, Calendar, Quote, ShieldAlert } from 'lucide-react';
import { approveReportedReview, rejectReportedReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import StarRating from './star-rating';

interface ModerationClientProps {
  initialReviews: Review[];
}

const APPROVAL_THRESHOLD = 5;
const VOTED_REVIEWS_STORAGE_KEY = 'votedReviews';

export default function ModerationClient({ initialReviews }: ModerationClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [votedOn, setVotedOn] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedVoted = localStorage.getItem(VOTED_REVIEWS_STORAGE_KEY);
      if (storedVoted) {
        setVotedOn(new Set(JSON.parse(storedVoted)));
      }
    } catch (error) {
        console.error("Failed to load voted reviews from localStorage", error);
    }
  }, []);

  const handleVote = (reviewId: number, action: 'approve' | 'reject') => {
    if (votedOn.has(reviewId)) {
        toast({
            variant: "destructive",
            title: "Voto já registrado",
            description: "Você já votou nesta avaliação.",
        });
        return;
    }

    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveReportedReview(reviewId);
        } else {
          await rejectReportedReview(reviewId);
        }
        
        const newVotedOn = new Set(votedOn).add(reviewId);
        setVotedOn(newVotedOn);
        try {
            localStorage.setItem(VOTED_REVIEWS_STORAGE_KEY, JSON.stringify(Array.from(newVotedOn)));
        } catch (error) {
            console.error("Failed to save voted reviews to localStorage", error);
        }

        setReviews(prev => prev.filter(r => r.id !== reviewId));
        toast({
          title: 'Voto registrado!',
          description: `Obrigado por ajudar a moderar a comunidade.`,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
            variant: "destructive",
            title: "Erro ao registrar voto",
            description: errorMessage,
        });
      }
    });
  };

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data inválida";
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    } catch (e) {
        return "Data inválida";
    }
  }

  if (reviews.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <ShieldAlert className="h-16 w-16 text-primary" />
            <h2 className="text-2xl font-bold">Tudo em ordem!</h2>
            <p className="max-w-md">Não há nenhuma avaliação denunciada aguardando moderação no momento. Volte mais tarde!</p>
        </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-card/50 shadow-md">
          <CardHeader>
            <CardTitle>Avaliação Denunciada</CardTitle>
            <CardDescription>
                A avaliação a seguir foi denunciada por um ou mais usuários. Por favor, analise o conteúdo e decida se ele deve ser removido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="border p-4 rounded-lg bg-background">
                <div className="flex justify-between items-center mb-2">
                     <StarRating rating={review.rating} />
                     <Badge variant="destructive">
                        {review.report_approvals} / {APPROVAL_THRESHOLD} votos para remoção
                     </Badge>
                </div>
                <blockquote className="border-l-4 border-primary pl-4 italic my-2">
                    <Quote className="h-5 w-5 text-muted-foreground inline-block mr-2" />
                    {review.text}
                </blockquote>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3"/> Professor: <strong>{review.teacherName}</strong></div>
                    <div className="flex items-center gap-1.5"><Tag className="h-3 w-3"/> Matéria: <strong>{review.subjectName}</strong></div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3"/> Data: {formatDate(review.createdAt)}</div>
                </div>
             </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => handleVote(review.id, 'reject')} disabled={isPending || votedOn.has(review.id)}>
              <ThumbsDown className="mr-2" />
              Manter Avaliação
            </Button>
            <Button variant="destructive" onClick={() => handleVote(review.id, 'approve')} disabled={isPending || votedOn.has(review.id)}>
              <ThumbsUp className="mr-2" />
              Remover Avaliação
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
