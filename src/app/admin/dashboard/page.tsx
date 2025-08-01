
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportedReviews, getDashboardStats } from "@/lib/data-service";
import { ShieldAlert, Bot, LayoutDashboard } from "lucide-react";
import ReportedReviewsClient from "./reported-reviews-client";
import AIModerationClient from "./ai-moderation-client";
import DashboardClient from "./dashboard-client";

export default async function AdminDashboardPage() {
    // Fetch all necessary data in parallel
    const [reportedReviews, dashboardStats] = await Promise.all([
        getReportedReviews(),
        getDashboardStats()
    ]);

    return (
        <div className="flex-1 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="dashboard" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="user_reports" className="gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Denúncias ({reportedReviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="ai_moderation" className="gap-2">
                        <Bot className="h-4 w-4" />
                        Moderação IA
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-6">
                    <DashboardClient stats={dashboardStats} />
                </TabsContent>
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
