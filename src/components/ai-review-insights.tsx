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

interface AIReviewInsightsProps {
  teacher: Teacher;
  children: ReactNode;
}

export default function AIReviewInsights({ teacher, children }: AIReviewInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !insights) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAIInsights({
          teacherName: teacher.name,
          subject: teacher.subject || 'General',
          reviews: teacher.reviews.map(r => r.text),
        });
        setInsights(result.insights);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error Generating Insights',
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Review Insights
          </DialogTitle>
          <DialogDescription>
            An AI-generated summary of student feedback for {teacher.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {insights && (
            <div className="prose prose-sm max-w-none text-foreground/90 flex items-start gap-3 rounded-lg border bg-secondary/50 p-4">
               <Bot className="h-8 w-8 flex-shrink-0 text-primary mt-1" />
               <p className="m-0">{insights}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
