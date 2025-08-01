
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { Star, PlusCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox } from './ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import type { Teacher } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { MultiSelect } from './ui/multi-select';

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

export function AddTeacherOrReviewDialog({ 
    allSubjectNames,
    allTeachers,
    onSubmit,
}: AddTeacherOrReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
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

  const handleSubmit = async (values: FormValues) => {
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
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
             <Button size="lg" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" />
                Adicionar Avaliação
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl grid-rows-[auto,1fr,auto] p-0">
            <DialogHeader className="px-6 pt-6">
                <DialogTitle>Adicionar nova avaliação</DialogTitle>
                <DialogDescription>
                    Selecione o professor e a(s) matéria(s) que ele leciona. A avaliação será aplicada a cada matéria selecionada.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-rows-[1fr,auto] h-[70vh]">
                    <ScrollArea className="h-full">
                        <div className="space-y-4 px-6 pb-6">
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
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Compartilhe sua experiência com este professor..."
                                            {...field}
                                        />
                                    </FormControl>
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
                        </div>
                    </ScrollArea>
                    <div className="p-6 pt-4 border-t bg-background rounded-b-lg">
                         <Alert className="bg-primary/10 text-primary border-primary/20 mb-4">
                            <ShieldAlert className="h-4 w-4 !text-primary" />
                            <AlertTitle className="font-semibold !text-primary">Aviso</AlertTitle>
                            <AlertDescription className="!text-primary/80">
                                Lembre-se de ser respeitoso e focar na didática. Avaliações com ataques pessoais, discurso de ódio ou informações falsas serão removidas.
                            </AlertDescription>
                        </Alert>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
