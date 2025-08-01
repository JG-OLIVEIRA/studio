
'use server';

import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function login(password: string) {
  if (password === process.env.ADMIN_SECRET) {
    await createSession();
    redirect('/admin/dashboard');
  } else {
    return { error: 'Senha incorreta.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/admin');
}
