
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MessageSquareText, BookOpen, ShieldAlert } from "lucide-react";

interface DashboardClientProps {
    stats: {
        totalTeachers: number;
        totalReviews: number;
        totalSubjects: number;
        reportedReviews: number;
    };
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function DashboardClient({ stats }: DashboardClientProps) {

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de Professores" value={stats.totalTeachers} icon={Users} />
                <StatCard title="Total de Avaliações" value={stats.totalReviews} icon={MessageSquareText} />
                <StatCard title="Total de Matérias" value={stats.totalSubjects} icon={BookOpen} />
                <StatCard title="Denúncias Pendentes" value={stats.reportedReviews} icon={ShieldAlert} />
             </div>
        </div>
    )
}
