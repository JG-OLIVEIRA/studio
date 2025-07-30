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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const reviewSchema = z.object({
  author: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  text: z.string().trim().min(15, "A avaliação deve ter pelo menos 15 caracteres."),
  rating: z.number().min(1, "A nota é obrigatória.").max(5),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

interface AddReviewFormProps {
  onSubmit: (data: ReviewFormValues) => void;
  onClose: () => void;
}

export function AddReviewForm({ onSubmit, onClose }: AddReviewFormProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: "",
      text: "",
      rating: 0,
    },
  })
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu Nome</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Enviar Avaliação</Button>
        </div>
      </form>
    </Form>
  )
}
