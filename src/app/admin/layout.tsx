
'use client';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen w-full bg-black text-white">
        {!isLoginPage && (
            <header className="absolute top-0 right-0 p-4">
                <form action={logout}>
                  <Button type="submit" variant="ghost" className="hover:bg-white/10 hover:text-white">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                  </Button>
                </form>
            </header>
        )}
        {children}
    </div>
  )
}
