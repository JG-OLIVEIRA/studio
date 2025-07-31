'use client';

import { useState, type ReactNode } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getAIInsights } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Teacher } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import StarRating from './star-rating';
import { Separator } from './ui/separator';

interface AIReviewInsightsProps {
  teacher: Teacher;
  children: ReactNode;
  disabled: boolean;
}

interface InsightsData {
    insights: string;
    passWithoutStudyingChance: number;
}

export default function AIReviewInsights({ teacher, children, disabled }: AIReviewInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const { toast } = useToast();

  const handleOpenChange = async (open: boolean) => {
    if (disabled) return;
    setIsOpen(open);
    if (open && !data) {
      setIsLoading(true);
      try {
        const result = await getAIInsights({
          teacherName: teacher.name,
          subject: teacher.subject || 'Geral',
          reviews: teacher.reviews.map(r => r.text),
        });
        setData({
            insights: result.insights,
            passWithoutStudyingChance: result.passWithoutStudyingChance
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        setData({
            insights: `Ocorreu um erro ao gerar a análise: ${errorMessage}`,
            passWithoutStudyingChance: 0
        });
        toast({
          variant: 'destructive',
          title: 'Erro ao Gerar Insights',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise de Avaliações por IA
          </DialogTitle>
          <DialogDescription>
            Um resumo gerado por IA do feedback dos alunos para {teacher.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Separator />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          )}
          {data && (
            <>
              <div className="prose prose-sm max-w-none text-foreground/90 flex items-start gap-3 rounded-lg border bg-secondary/50 p-4">
                 <Bot className="h-8 w-8 flex-shrink-0 text-primary mt-1" />
                 <p className="m-0">{data.insights}</p>
              </div>
              {data.passWithoutStudyingChance > 0 && (
                <>
                    <Separator />
                    <div className="text-center space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Chance de Passar Sem Estudar™</h4>
                        <div className="flex justify-center">
                            <StarRating rating={data.passWithoutStudyingChance} />
                        </div>
                    </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
