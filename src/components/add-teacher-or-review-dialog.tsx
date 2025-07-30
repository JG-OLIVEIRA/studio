"use client";

import { useState, useMemo, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  } from './ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Teacher } from '@/lib/types';
import { Combobox } from './ui/combobox';

const formSchema = z.object({
  teacherName: z.string().min(2, "O nome do professor deve ter pelo menos 2 caracteres."),
  subjectName: z.string().min(1, "Por favor, selecione ou crie uma matéria."),
  reviewAuthor: z.string().min(2, "Seu nome deve ter pelo menos 2 caracteres."),
  reviewText: z.string().min(10, "A avaliação deve ter pelo menos 10 caracteres."),
  reviewRating: z.number().min(1, "A nota é obrigatória.").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeacherOrReviewDialogProps {
    children: ReactNode;
    allTeachers: (Teacher & { subject: string })[];
    allSubjectNames: string[];
    onSubmit: (data: FormValues) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTeacherOrReviewDialog({ 
    children, 
    allTeachers, 
    allSubjectNames,
    onSubmit,
    open,
    onOpenChange 
}: AddTeacherOrReviewDialogProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const subjectOptions = useMemo(() => {
    return allSubjectNames.map(name => ({ value: name, label: name }));
  }, [allSubjectNames]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: "",
      subjectName: "",
      reviewAuthor: "",
      reviewText: "",
      reviewRating: 0,
    },
  });

  const teacherName = useWatch({ control: form.control, name: 'teacherName' });
  const subjectName = useWatch({ control: form.control, name: 'subjectName' });

  const teacherExists = useMemo(() => {
    if (!teacherName || !subjectName) return false;
    return allTeachers.some(
      (t) => t.name.toLowerCase() === teacherName.toLowerCase() && t.subject.toLowerCase() === subjectName.toLowerCase()
    );
  }, [teacherName, subjectName, allTeachers]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{teacherExists ? `Adicionar avaliação para ${teacherName}` : `Adicionar novo professor`}</DialogTitle>
            <DialogDescription>
                {teacherExists 
                    ? `Este professor já está em nosso banco de dados para esta matéria. Por favor, adicione sua avaliação abaixo.`
                    : `Este professor ainda não está em nosso banco de dados. Adicione os detalhes e sua primeira avaliação!`}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="teacherName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nome do Professor</FormLabel>
                            <FormControl>
                                <Input placeholder="ex: Sr. Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subjectName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Matéria</FormLabel>
                             <Combobox
                                options={subjectOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Selecione ou crie..."
                                createLabel="Criar matéria:"
                            />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="reviewAuthor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="ex: Joana da Silva" {...field} />
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
                        <FormLabel>Avaliação</FormLabel>
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
                        <FormLabel>Nota</FormLabel>
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
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Enviar</Button>
                </div>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
