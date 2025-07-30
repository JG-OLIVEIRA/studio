"use client";

import { useState, useMemo, useEffect, type ReactNode } from 'react';
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
    DialogTrigger,
  } from './ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Teacher } from '@/lib/types';

const formSchema = z.object({
  teacherName: z.string().min(2, "Teacher name must be at least 2 characters."),
  subjectName: z.string().min(1, "Please select a subject."),
  reviewAuthor: z.string().min(2, "Your name must be at least 2 characters."),
  reviewText: z.string().min(10, "Review must be at least 10 characters."),
  reviewRating: z.number().min(1, "Rating is required.").max(5),
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
      (t) => t.name.toLowerCase() === teacherName.toLowerCase() && t.subject === subjectName
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
            <DialogTitle>{teacherExists ? `Add a review for ${teacherName}` : `Add a new teacher`}</DialogTitle>
            <DialogDescription>
                {teacherExists 
                    ? `This teacher is already in our database. Please add your review below.`
                    : `This teacher is not in our database yet. Add their details and your first review!`}
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
                            <FormLabel>Teacher's Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Mr. Smith" {...field} />
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
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {allSubjectNames.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
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
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
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
                        <FormLabel>Review</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Share your experience with this teacher..."
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
                        <FormLabel>Rating</FormLabel>
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
                                        : 'text-muted/50'
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
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
