
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Token expires in 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This will be caught if the token is invalid or expired
    return null;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const session = await encrypt({ expires });

  cookies().set('session', session, { expires, httpOnly: true });
}

export async function verifySession() {
    const cookie = cookies().get('session')?.value;
    if (!cookie) return null;
    return await decrypt(cookie);
}

export async function deleteSession() {
  cookies().delete('session');
}
