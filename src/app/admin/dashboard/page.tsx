
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportedReviews } from "@/lib/data-service";
import { ShieldAlert, Bot } from "lucide-react";
import ReportedReviewsClient from "./reported-reviews-client";
import AIModerationClient from "./ai-moderation-client";

export default async function AdminDashboardPage() {
    const reportedReviews = await getReportedReviews();

    return (
        <div className="flex-1 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
            <Tabs defaultValue="user_reports" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="user_reports" className="gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Denúncias de Usuários ({reportedReviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="ai_moderation" className="gap-2">
                        <Bot className="h-4 w-4" />
                        Moderação por IA
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user_reports" className="mt-6">
                    <ReportedReviewsClient initialReviews={reportedReviews} />
                </TabsContent>
                <TabsContent value="ai_moderation" className="mt-6">
                    <AIModerationClient />
                </TabsContent>
            </Tabs>
        </div>
    )
}
