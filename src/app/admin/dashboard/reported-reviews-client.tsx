
'use client';

import { useState, useTransition } from 'react';
import type { Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveReviewAction, deleteReviewAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Check, Trash2, ShieldQuestion } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ReportedReviewsClientProps {
  initialReviews: (Review & { teacherName: string, subjectName: string })[];
}

export default function ReportedReviewsClient({ initialReviews }: ReportedReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleApprove = (reviewId: number) => {
    startTransition(async () => {
      try {
        await approveReviewAction(reviewId);
        setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
        toast({
          title: 'Avaliação Aprovada',
          description: 'A avaliação foi marcada como não-problemática e está visível novamente.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível aprovar a avaliação.',
        });
      }
    });
  };

  const handleDelete = (reviewId: number) => {
    startTransition(async () => {
      try {
        await deleteReviewAction(reviewId);
        setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
        toast({
          title: 'Avaliação Deletada',
          description: 'A avaliação foi removida permanentemente.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível deletar a avaliação.',
        });
      }
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Moderação de Conteúdo Denunciado</CardTitle>
            <CardDescription>
                Abaixo estão as avaliações que foram denunciadas pelos usuários. Revise o conteúdo e decida se a avaliação deve ser mantida (Aprovar) ou removida (Deletar).
            </CardDescription>
        </CardHeader>
        <CardContent>
            {reviews.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Matéria</TableHead>
                            <TableHead className="w-[50%]">Texto da Avaliação</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                            <TableCell className="font-medium">{review.teacherName}</TableCell>
                            <TableCell>{review.subjectName}</TableCell>
                            <TableCell className="text-muted-foreground">{review.text}</TableCell>
                            <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprove(review.id)}
                                    disabled={isPending}
                                >
                                    <Check className="mr-2 h-4 w-4" /> Aprovar
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDelete(review.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                    <ShieldQuestion className="h-12 w-12" />
                    <h3 className="text-xl font-semibold">Nenhuma avaliação denunciada!</h3>
                    <p>Tudo certo por aqui. Volte mais tarde para verificar se há novas denúncias de usuários.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
