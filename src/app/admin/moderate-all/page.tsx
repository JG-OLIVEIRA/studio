
import { moderateAllReviews } from "@/lib/data-service";
import { revalidatePath } from "next/cache";
import MainLayout from "@/components/main-layout";

export const dynamic = 'force-dynamic'; // Garante que esta página não seja cacheada

interface AdminPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminModerateAllPage({ searchParams }: AdminPageProps) {
    const secret = searchParams['secret'];

    if (process.env.NODE_ENV === 'production' && secret !== process.env.ADMIN_SECRET) {
        return (
            <MainLayout headerProps={{ pageTitle: "Acesso Negado", pageIconName: "ShieldAlert" }}>
                <div className="container mx-auto p-8 text-center">
                    <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
                    <p className="text-muted-foreground mt-2">Segredo de administração inválido.</p>
                </div>
            </MainLayout>
        )
    }

    const { total, removed } = await moderateAllReviews();

    // Revalida o cache para que as remoções apareçam imediatamente
    revalidatePath('/');
    revalidatePath('/subjects');

    return (
        <MainLayout headerProps={{ pageTitle: "Moderação em Massa", pageIconName: "ShieldCheck" }}>
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold text-primary">Moderação Concluída!</h1>
                <div className="mt-4 text-lg space-y-2">
                    <p>Total de avaliações analisadas: <span className="font-bold">{total}</span></p>
                    <p>Total de avaliações removidas: <span className="font-bold text-destructive">{removed}</span></p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                    Você pode fechar esta página. As alterações já foram aplicadas em todo o site.
                </p>
            </div>
        </MainLayout>
    )
}
