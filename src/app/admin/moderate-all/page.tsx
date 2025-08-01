
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and will redirect to the new admin dashboard.
export default function DeprecatedAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecionando para o novo painel de administração...</p>
    </div>
  );
}
