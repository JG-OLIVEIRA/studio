
'use client';

import { useState, useTransition } from 'react';
import type { Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveReviewAction, deleteReviewAction, runAIModeration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Check, Trash2, ShieldQuestion, Bot, Loader2, Wand2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ProblematicReview = Review & { teacherName: string, subjectName: string, reason: string };

export default function AIModerationClient() {
  const [reviews, setReviews] = useState<ProblematicReview[]>([]);
  const [isScanPending, startScanTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const { toast } = useToast();

  const handleRunScan = () => {
    startScanTransition(async () => {
        try {
            const result = await runAIModeration();
            setReviews(result);
            toast({
                title: 'Verificação por IA Concluída',
                description: `${result.length} avaliações foram sinalizadas como potencialmente problemáticas.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro na Verificação',
                description: 'Não foi possível executar a verificação por IA.',
            });
        }
    });
  };

  const handleApprove = (reviewId: number) => {
    startActionTransition(async () => {
      try {
        // Here, approving means we just remove it from the current client-side list.
        // The review is already "approved" in the DB (reported=false), the AI just flagged it.
        // If we wanted to mark it so the AI doesn't flag it again, we'd need a new DB field.
        setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
        toast({
          title: 'Avaliação Ignorada',
          description: 'A avaliação foi removida da lista de problemas da IA para esta sessão.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível ignorar a avaliação.',
        });
      }
    });
  };

  const handleDelete = (reviewId: number) => {
    startActionTransition(async () => {
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
            <CardTitle>Moderação de Conteúdo por IA</CardTitle>
            <CardDescription>
                A IA pode analisar todas as avaliações não denunciadas no banco de dados e sinalizar aquelas que podem violar as diretrizes. Clique no botão abaixo para iniciar a verificação.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-center">
                 <Button
                    onClick={handleRunScan}
                    disabled={isScanPending}
                    size="lg"
                >
                    {isScanPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-5 w-5" />
                    )}
                    Executar Verificação com IA
                </Button>
            </div>

            {reviews.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead className="w-[40%]">Texto da Avaliação</TableHead>
                            <TableHead>Motivo da IA</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                            <TableCell className="font-medium">{review.teacherName}</TableCell>
                            <TableCell className="text-muted-foreground">{review.text}</TableCell>
                             <TableCell>
                                <Alert variant="destructive" className="bg-destructive/10 text-destructive-foreground border-destructive/20 p-2">
                                    <AlertDescription className="!text-destructive/90 text-xs">
                                        {review.reason}
                                    </AlertDescription>
                                </Alert>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprove(review.id)}
                                    disabled={isActionPending}
                                >
                                    <Check className="mr-2 h-4 w-4" /> Ignorar
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDelete(review.id)}
                                    disabled={isActionPending}
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
                 !isScanPending && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                        <Bot className="h-12 w-12" />
                        <h3 className="text-xl font-semibold">Nenhuma avaliação sinalizada pela IA</h3>
                        <p>Execute a verificação para encontrar avaliações potencialmente problemáticas ou, se já executou, parabéns, está tudo limpo!</p>
                    </div>
                )
            )}
        </CardContent>
    </Card>
  );
}
