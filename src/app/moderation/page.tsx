
import MainLayout from "@/components/main-layout";
import { getReportedReviews, initializeDatabase } from "@/lib/data-service";
import ModerationClient from "@/components/moderation-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ModerationPage() {
    await initializeDatabase();
    const reportedReviews = await getReportedReviews();

    const headerContent = (
        <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Ajude a manter a comunidade segura. Avalie as denúncias feitas por outros usuários.
            </p>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a Página Inicial
                </Link>
            </Button>
        </div>
    );

    return (
        <MainLayout headerProps={{
            pageTitle: "Moderação Comunitária",
            pageIconName: "ShieldCheck",
            children: headerContent
        }}>
            <div className="container mx-auto px-4 py-8">
                <ModerationClient initialReviews={reportedReviews} />

                <footer className="text-center mt-16 pb-8">
                    <p className="text-sm text-muted-foreground">
                        Obrigado por ajudar a manter a plataforma um lugar seguro e construtivo.
                    </p>
                </footer>
            </div>
        </MainLayout>
    );
}
