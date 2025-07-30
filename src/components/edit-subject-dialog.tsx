
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import type { Subject } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { updateSubjectName } from "@/app/actions"


const formSchema = z.object({
  name: z.string().trim()
    .min(4, "O nome da matéria deve ter pelo menos 4 caracteres.")
    .max(100, "O nome da matéria deve ter no máximo 100 caracteres."),
})

type FormValues = z.infer<typeof formSchema>

interface EditSubjectDialogProps {
    subject: Subject;
    children: React.ReactNode;
}

export function EditSubjectDialog({ subject, children }: EditSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject.name,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
        await updateSubjectName(subject.id, data.name);
        toast({
            title: "Sucesso!",
            description: "O nome da matéria foi atualizado.",
        });
        setOpen(false);
        form.reset({ name: data.name }); // Update default value
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
            variant: "destructive",
            title: "Erro ao atualizar",
            description: errorMessage,
        });
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset({ name: subject.name });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Nome da Matéria</DialogTitle>
          <DialogDescription>
            Altere o nome da matéria "{subject.name}". Essa alteração será refletida em toda a aplicação.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Nome da Matéria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cálculo I" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
