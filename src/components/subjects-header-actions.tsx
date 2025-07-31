
'use client';

import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function SubjectsHeaderActions() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Professores
            </Link>
            <a
                href="https://hackmd.io/@rMoy5VzZSwKKbif_E09fBw/BJEaUJ2cT"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "default" }))}
            >
                <MessageSquareText className="mr-2 h-4 w-4" />
                Grupos de WhatsApp
            </a>
        </div>
    )
}
