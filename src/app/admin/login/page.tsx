
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(password);
      if (result.success) {
        router.push('/admin/dashboard');
        router.refresh(); // Ensure the layout updates and middleware re-evaluates
      } else {
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: result.error,
        });
      }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Ocorreu um erro inesperado. Tente novamente.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <Card className="w-full max-w-sm bg-black border-zinc-800 text-white">
            <form onSubmit={handleSubmit}>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-zinc-800 p-3 rounded-full mb-4">
                        <Lock className="h-6 w-6 text-primary"/>
                    </div>
                    <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Por favor, insira a senha para acessar o painel de administração.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary focus:border-primary"
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Entrar
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
