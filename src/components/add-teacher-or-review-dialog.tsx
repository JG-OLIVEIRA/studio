
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
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Teacher } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Combobox } from './ui/combobox';

const formSchema = z.object({
  teacherName: z.string().trim()
    .min(3, "O nome do professor deve ter pelo menos 3 caracteres."),
  subjectName: z.string().trim()
    .min(1, "É necessário selecionar uma matéria."),
  reviewText: z.string().trim()
    .min(25, "A avaliação deve ter pelo menos 25 caracteres.")
    .max(1000, "A avaliação deve ter no máximo 1000 caracteres."),
  reviewRating: z.number().min(1, "A nota é obrigatória.").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTeacherOrReviewDialogProps {
    children: ReactNode;
    allTeachers: (Teacher & { subject: string })[];
    allSubjectNames: string[];
    onSubmit: (data: Omit<FormValues, 'reviewAuthor'>) => void;
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: "",
      subjectName: "",
      reviewText: "",
      reviewRating: 0,
    },
  });

  const subjectName = useWatch({ control: form.control, name: 'subjectName' });

  const subjectOptions = useMemo(() => {
    return allSubjectNames.map(name => ({ value: name, label: name }));
  }, [allSubjectNames]);

  const teacherOptions = useMemo(() => {
    if (!subjectName) return [];
    return allTeachers
        .filter(teacher => teacher.subject === subjectName)
        .map(teacher => ({ value: teacher.name, label: teacher.name }))
        .sort((a,b) => a.label.localeCompare(b.label));
  }, [subjectName, allTeachers]);


  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        {children}
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Adicionar nova avaliação</DialogTitle>
            <DialogDescription>
                Selecione a matéria e informe o nome do professor. Se o professor não existir na matéria, ele será criado.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="subjectName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Matéria</FormLabel>
                             <Select onValueChange={(value) => {
                                 field.onChange(value);
                                 form.setValue('teacherName', ''); // Reset teacher when subject changes
                             }} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a matéria" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {subjectOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="teacherName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Professor</FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={teacherOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Selecione ou crie..."
                                        createLabel="Criar novo professor:"
                                        disabled={!subjectName}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
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
