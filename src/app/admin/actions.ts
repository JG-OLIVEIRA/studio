
'use server';

import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

// Carrega as variáveis de ambiente no início do arquivo
import dotenv from 'dotenv';
dotenv.config();

export async function login(password: string) {
  // Agora process.env.ADMIN_SECRET terá o valor correto
  if (password === process.env.ADMIN_SECRET) {
    await createSession();
    redirect('/admin/dashboard');
  } else {
    return { error: 'Senha incorreta