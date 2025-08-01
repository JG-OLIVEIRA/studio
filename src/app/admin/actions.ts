
'use server';

import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function login(password: string) {
  if (password === process.env.ADMIN_SECRET) {
    await create