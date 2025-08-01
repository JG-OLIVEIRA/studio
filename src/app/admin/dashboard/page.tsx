
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6" />
                        Painel de Administração
                    </CardTitle>
                    <CardDescription>
                        Bem-vindo ao painel de administração. Em breve, aqui você poderá gerenciar professores, matérias e avaliações.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Funcionalidades futuras:</p>
                    <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                        <li>Visualizar e gerenciar todas as avaliações (incluindo as denunciadas).</li>
                        <li>Editar ou remover professores.</li>
                        <li>Editar ou remover matérias.</li>
                        <li>Ver estatísticas do site.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
