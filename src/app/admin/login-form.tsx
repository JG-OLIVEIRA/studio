
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LoginForm() {
  const [state, action] = useFormState(login, undefined);

  return (
    <form action={action} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-800 px-6 pb-4 pt-8">
        <h2 className="mb-3 text-xl text-gray-200">
          Faça login para continuar.
        </h2>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-300"
              htmlFor="password"
            >
              Senha
            </label>
            <div className="relative">
              <Input
                className="peer block w-full rounded-md border border-gray-700 bg-gray-900 py-[9px] pl-4 text-sm text-white outline-none placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Digite a senha de admin"
                required
              />
            </div>
          </div>
        </div>
        <LoginButton />
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {state?.error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-red-300 mt-4">
                <AlertCircle className="h-4 w-4 !text-red-400" />
                <AlertTitle className="!text-red-300">Erro de Login</AlertTitle>
                <AlertDescription className="!text-red-400/80">
                    {state.error}
                </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700" aria-disabled={pending}>
      Entrar <LogIn className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
