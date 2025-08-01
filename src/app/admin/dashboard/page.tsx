
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportedReviews, getDashboardStats, getRecentReviews } from "@/lib/data-service";
import { ShieldAlert, Bot, LayoutDashboard, Activity } from "lucide-react";
import ReportedReviewsClient from "./reported-reviews-client";
import AIModerationClient from "./ai-moderation-client";
import DashboardClient from "./dashboard-client";
import RecentActivityClient from "./recent-activity-client";

export default async function AdminDashboardPage() {
    // Fetch all necessary data in parallel
    const [reportedReviews, dashboardStats, recentReviews] = await Promise.all([
        getReportedReviews(),
        getDashboardStats(),
        getRecentReviews(10), // Fetch last 10 reviews
    ]);

    return (
        <div className="flex-1 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="dashboard" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                     <TabsTrigger value="activity" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Atividade Recente
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
                <TabsContent value="activity" className="mt-6">
                    <RecentActivityClient reviews={recentReviews} />
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
