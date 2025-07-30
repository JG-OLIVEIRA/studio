
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { handleAddTeacherOrReview } from "@/app/actions"
import type { Teacher } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

const reviewSchema = z.object({
  text: z.string().trim()
    .min(25, "A avaliação deve ter pelo menos 25 caracteres.")
    .max(1000, "A avaliação deve ter no máximo 1000 caracteres."),
  rating: z.number().min(1, "A nota é obrigatória.").max(5),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

interface AddReviewFormProps {
  teacher: Teacher;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReviewForm({ teacher, children, open, onOpenChange }: AddReviewFormProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      text: "",
      rating: 0,
    },
  })
  const [hoverRating, setHoverRating] = useState(0)

  const onSubmit = async (data: ReviewFormValues) => {
    if (!teacher.subject) {
      console.error("A matéria do professor não foi definida. Não é possível adicionar avaliação.");
      return;
    }
    
    await handleAddTeacherOrReview({
        teacherName: teacher.name,
        subjectName: teacher.subject,
        reviewText: data.text,
        reviewRating: data.rating,
    });

    onOpenChange(false);
    form.reset();
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
    }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar avaliação para {teacher.name}</DialogTitle>
          <DialogDescription>
            Compartilhe sua experiência para ajudar os outros.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua Avaliação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte-nos o que você acha deste professor..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1
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
                                "h-6 w-6 cursor-pointer",
                                ratingValue <= (hoverRating || field.value)
                                  ? "text-primary fill-current"
                                  : "text-muted-foreground/50"
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

