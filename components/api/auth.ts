import { AUTH_API_URL } from '@env';

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_API_URL}auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`${AUTH_API_URL}auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
