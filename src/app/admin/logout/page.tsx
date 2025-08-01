
'use server';
import { logout } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function LogoutPage() {
    await logout();
    // The logout action itself redirects, but we have a fallback here.
    redirect('/admin/login');
}
