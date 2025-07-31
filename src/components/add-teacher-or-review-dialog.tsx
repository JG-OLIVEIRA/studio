
"use client";

import { useState, useMemo, type ReactNode } from 'react';
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
import { Star, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox } from './ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

const formSchema = z.object({
  teacherName: z.string().trim()
    .min(3, "O nome do professor deve ter pelo menos 3 caracteres."),
  subjectNames: z.array(z.string()).nonempty("É necessário selecionar pelo menos uma matéria."),
  reviewText: z.string().trim()
    .min(25, "A avaliação deve ter pelo menos 25 caracteres.")
    .max(1000, "A avaliação deve ter no máximo 1000 caracteres."),
  reviewRating: z.number().min(1, "A nota é obrigatória.").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeacherOrReviewDialogProps {
    allSubjectNames: string[];
    allTeachers: { id: number, name: string }[];
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

  const subjectOptions = useMemo(() => {
    return allSubjectNames.map(name => ({ value: name, label: name })).sort((a, b) => a.label.localeCompare(b.label));
  }, [allSubjectNames]);

  const teacherOptions = useMemo(() => {
    return allTeachers
        .map(teacher => ({ value: teacher.name, label: teacher.name }))
        .sort((a,b) => a.label.localeCompare(b.label));
  }, [allTeachers]);


  const handleSubmit = async (values: FormValues) => {
    try {
        await onSubmit(values);
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
            title: "Erro ao enviar avaliação",
            description: errorMessage,
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
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
            <DialogTitle>Adicionar nova avaliação</DialogTitle>
            <DialogDescription>
                Selecione o professor e a(s) matéria(s) que ele leciona. A avaliação será aplicada a cada matéria selecionada.
            </DialogDescription>
            </DialogHeader>
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
                            <ScrollArea className="h-32 w-full rounded-md border p-2">
                                <div className="flex flex-wrap gap-2">
                                {subjectOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={field.value.includes(option.value) ? "default" : "outline"}
                                        onClick={() => {
                                            const currentSubjects = field.value;
                                            const newSubjects = currentSubjects.includes(option.value)
                                            ? currentSubjects.filter(sub => sub !== option.value)
                                            : [...currentSubjects, option.value];
                                            field.onChange(newSubjects);
                                        }}
                                        className="h-auto py-1 px-3"
                                    >
                                    {option.label}
                                    </Button>
                                ))}
                                </div>
                            </ScrollArea>
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
                        <FormLabel>Avaliação Escrita</FormLabel>
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
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                </div>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
