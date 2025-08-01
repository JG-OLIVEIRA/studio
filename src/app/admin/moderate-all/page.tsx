
import { moderateAllReviews } from "@/lib/data-service";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic'; // Garante que esta página não seja cacheada

interface AdminPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminModerateAllPage({ searchParams }: AdminPageProps) {
    const secret = searchParams['secret'];

    if (process.env.NODE_ENV === 'production' && secret !== process.env.ADMIN_SECRET) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
                <p className="text-muted-foreground mt-2">Segredo de administração inválido.</p>
            </div>
        )
    }

    const { total, removed } = await moderateAllReviews();

    // Revalida o cache para que as remoções apareçam imediatamente
    revalidatePath('/');
    revalidatePath('/subjects');

    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold text-primary">Moderação Concluída!</h1>
            <div className="mt-4 text-lg">
                <p>Total de avaliações analisadas: <span className="font-bold">{total}</span></p>
                <p>Total de avaliações removidas: <span className="font-bold">{removed}</span></p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
                Você pode fechar esta página.
            </p>
        </div>
    )
}
