
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
  } from './ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, PlusCircle, ShieldAlert, Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox } from './ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import type { Teacher } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { MultiSelect } from './ui/multi-select';
import { checkReviewRealtime } from '@/app/actions';

const formSchema = z.object({
  teacherName: z.string().trim()
    .min(3, "O nome do professor deve ter pelo menos 3 caracteres."),
  subjectNames: z.array(z.string()).nonempty("É necessário selecionar pelo menos uma matéria."),
  reviewText: z.string().trim()
    .max(1000, "A avaliação deve ter no máximo 1000 caracteres.")
    .optional(),
  reviewRating: z.number().min(1, "A nota é obrigatória.").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeacherOrReviewDialogProps {
    allSubjectNames: string[];
    allTeachers: Teacher[];
    onSubmit: (data: Omit<FormValues, 'reviewAuthor'>) => Promise<void>;
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: NodeJS.Timeout | null = null;
  
    const debounced = (...args: Parameters<F>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  
    return debounced as (...args: Parameters<F>) => void;
}


export function AddTeacherOrReviewDialog({ 
    allSubjectNames,
    allTeachers,
    onSubmit,
}: AddTeacherOrReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [moderationResult, setModerationResult] = useState<{ isProblematic: boolean; reason?: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: "",
      subjectNames: [],
      reviewText: "",
      reviewRating: 0,
    },
  });
  
  const selectedTeacherName = form.watch('teacherName');
  const reviewTextValue = form.watch('reviewText');

  const selectedTeacher = useMemo(() => {
    return allTeachers.find(t => t.name === selectedTeacherName);
  }, [selectedTeacherName, allTeachers]);

  const subjectOptions = useMemo(() => {
    const allOptions = allSubjectNames.map(name => ({ value: name, label: name }));

    if (selectedTeacher && selectedTeacher.subjects) {
      const teacherSubjects = new Set(selectedTeacher.subjects);
      
      const taught = allOptions
        .filter(opt => teacherSubjects.has(opt.value))
        .sort((a, b) => a.label.localeCompare(b.label));

      const notTaught = allOptions
        .filter(opt => !teacherSubjects.has(opt.value))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [...taught, ...notTaught];
    }

    return allOptions.sort((a, b) => a.label.localeCompare(b.label));
  }, [allSubjectNames, selectedTeacher]);

  const teacherOptions = useMemo(() => {
    return allTeachers
        .map(teacher => ({ value: teacher.name, label: teacher.name }))
        .sort((a,b) => a.label.localeCompare(b.label));
  }, [allTeachers]);


  // Effect to pre-select subjects when a teacher is chosen
  useEffect(() => {
    if (selectedTeacher) {
      const existingSubjectsForTeacher = selectedTeacher.subjects ? Array.from(selectedTeacher.subjects) : [];
      form.setValue('subjectNames', existingSubjectsForTeacher, { shouldValidate: true });
    } else {
        // If teacher is cleared, clear subjects
        form.setValue('subjectNames', [], { shouldValidate: true });
    }
  }, [selectedTeacher, form]);

  const debouncedCheck = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setModerationResult(null);
        setIsChecking(false);
        return;
      }
      try {
        const result = await checkReviewRealtime(text);
        setModerationResult(result);
      } catch (error) {
        // Silently fail or show a subtle indicator
        console.error("Real-time moderation failed:", error);
        setModerationResult(null); // Clear previous errors
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (reviewTextValue !== undefined) {
      setIsChecking(true);
      debouncedCheck(reviewTextValue);
    }
  }, [reviewTextValue, debouncedCheck]);

  const handleSubmit = async (values: FormValues) => {
    if (moderationResult?.isProblematic) {
        toast({
            variant: "destructive",
            title: "Revisão Necessária",
            description: "Por favor, ajuste o texto da sua avaliação para que ela esteja de acordo com as diretrizes.",
        });
        return;
    }

    try {
        await onSubmit({
            ...values,
            reviewText: values.reviewText || '', // Garante que o valor seja uma string vazia se for undefined
        });
        toast({
            title: "Avaliação enviada!",
            description: "Obrigado por contribuir com a comunidade.",
        });
        setOpen(false);
        form.reset();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
            variant: "destructive",
            title: "Erro ao Enviar Avaliação",
            description: errorMessage,
            duration: 9000,
        });
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
        setModerationResult(null);
        setIsChecking(false);
    }
    setOpen(isOpen);
  }

  const isSubmitDisabled = form.formState.isSubmitting || !!moderationResult?.isProblematic;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
             <Button size="lg" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" />
                Adicionar Avaliação
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl grid-rows-[auto,1fr,auto]">
            <DialogHeader>
            <DialogTitle>Adicionar nova avaliação</DialogTitle>
            <DialogDescription>
                Selecione o professor e a(s) matéria(s) que ele leciona. A avaliação será aplicada a cada matéria selecionada.
            </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-full overflow-auto pr-6 -mr-6">
                <div className="pr-6">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="teacherName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professor</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={teacherOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Selecione ou crie um professor..."
                                            createLabel="Criar novo professor:"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="subjectNames"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Matéria(s) Lecionada(s)</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={subjectOptions}
                                        selected={field.value}
                                        onChange={field.onChange}
                                        placeholder="Selecione as matérias..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="reviewText"
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Avaliação Escrita (Opcional)</FormLabel>
                                  {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Compartilhe sua experiência com este professor..."
                                        {...field}
                                        className={cn(moderationResult?.isProblematic && "border-destructive focus-visible:ring-destructive")}
                                    />
                                </FormControl>
                                 {moderationResult?.isProblematic && (
                                    <FormDescription className="text-destructive flex items-center gap-2 text-xs">
                                        <TriangleAlert className="h-4 w-4" />
                                        {moderationResult.reason}
                                    </FormDescription>
                                 )}
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reviewRating"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nota Geral</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => {
                                        const ratingValue = index + 1;
                                        return (
                                        <button
                                            type="button"
                                            key={ratingValue}
                                            onClick={() => field.onChange(ratingValue)}
                                            onMouseEnter={() => setHoverRating(ratingValue)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-0 bg-transparent border-none"
                                        >
                                            <Star
                                            className={cn(
                                                'h-6 w-6 cursor-pointer',
                                                ratingValue <= (hoverRating || field.value)
                                                ? 'text-primary fill-current'
                                                : 'text-muted-foreground/50'
                                            )}
                                            />
                                        </button>
                                        );
                                    })}
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Alert variant="destructive" className="bg-destructive/10 text-destructive-foreground border-destructive/20">
                            <ShieldAlert className="h-4 w-4 !text-destructive" />
                            <AlertTitle className="font-semibold !text-destructive">Aviso</AlertTitle>
                            <AlertDescription className="!text-destructive/80">
                                Lembre-se de ser respeitoso e focar na didática. Avaliações com ataques pessoais, discurso de ódio ou informações falsas serão removidas.
                            </AlertDescription>
                        </Alert>


                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitDisabled}>
                                {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                            </Button>
                        </div>
                    </form>
                    </Form>
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
  );
}
