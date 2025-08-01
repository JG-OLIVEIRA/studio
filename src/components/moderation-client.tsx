
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { ThumbsUp, ThumbsDown, User, Tag, Calendar, Quote, ShieldAlert, LogIn } from 'lucide-react';
import { approveReportedReview, rejectReportedReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import StarRating from './star-rating';

interface ModerationClientProps {
  initialReviews: Review[];
}

const APPROVAL_THRESHOLD = 5;
const USER_INFO_KEY = 'moderationUserInfo';

const loginSchema = z.object({
    email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
    studentId: z.string().regex(/^\d{9}$/, { message: "A matrícula deve conter 9 dígitos." })
        .refine(val => {
            const currentYear = new Date().getFullYear();
            const startYear = parseInt(val.substring(0, 4), 10);
            return startYear > 2000 && startYear <= currentYear;
        }, { message: "Ano de matrícula inválido." }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function ModerationClient({ initialReviews }: ModerationClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userInfo, setUserInfo] = useState<{email: string, studentId: string} | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
        console.error("Failed to load user info from localStorage", error);
    }
  }, []);

  const handleVote = (reviewId: number, action: 'approve' | 'reject') => {
    if (!userInfo) {
        toast({
            variant: "destructive",
            title: "Identificação necessária",
            description: "Você precisa se identificar para votar.",
        });
        return;
    }

    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveReportedReview(reviewId, userInfo.email);
        } else {
          await rejectReportedReview(reviewId, userInfo.email);
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

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', studentId: '' },
  });

  const handleLogin = (values: LoginValues) => {
    setUserInfo(values);
    try {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(values));
    } catch (error) {
      console.error("Failed to save user info to localStorage", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data inválida";
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
    } catch (e) {
        return "Data inválida";
    }
  }

  if (!userInfo) {
    return (
        <Card className="max-w-lg mx-auto bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LogIn/>
                    Identificação Necessária
                </CardTitle>
                <CardDescription>
                    Para garantir a integridade da moderação, por favor, informe seu e-mail e matrícula. Seus dados não serão exibidos publicamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl><Input placeholder="seu.email@aluno.uerj.br" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="studentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Matrícula</FormLabel>
                                    <FormControl><Input placeholder="Ex: 20241012345" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" className="w-full">Entrar na Moderação</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
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
                        {review.report_count || 0} / {APPROVAL_THRESHOLD} votos para remoção
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
            <Button variant="outline" onClick={() => handleVote(review.id, 'reject')} disabled={isPending}>
              <ThumbsDown className="mr-2" />
              Manter Avaliação
            </Button>
            <Button variant="destructive" onClick={() => handleVote(review.id, 'approve')} disabled={isPending}>
              <ThumbsUp className="mr-2" />
              Remover Avaliação
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
