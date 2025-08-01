
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportedReviews } from "@/lib/data-service";
import { ShieldAlert } from "lucide-react";
import ReportedReviewsClient from "./reported-reviews-client";

export default async function AdminDashboardPage() {
    const reportedReviews = await getReportedReviews();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Moderação de Conteúdo
                    </CardTitle>
                    <CardDescription>
                        Abaixo estão as avaliações que foram denunciadas pelos usuários. Revise o conteúdo e decida se a avaliação deve ser mantida (Aprovar) ou removida (Deletar).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportedReviewsClient initialReviews={reportedReviews} />
                </CardContent>
            </Card>
        </div>
    )
}
