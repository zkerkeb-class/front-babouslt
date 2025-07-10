import { BDD_API_URL } from '@env';

export async function getUserPains(userId: string) {
  try {
    const res = await fetch(`${BDD_API_URL}/pain/${userId}`);
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function createPain(payload: any) {
  try {
    const res = await fetch(`${BDD_API_URL}/pain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function getPainDetail(painId: string) {
  try {
    const res = await fetch(`${BDD_API_URL}/pain/detail/${painId}`);
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function addPainEvolution(painId: string, evolution: any) {
  try {
    const res = await fetch(`${BDD_API_URL}/pain/${painId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evolution),
    });
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function closePain(painId: string) {
  try {
    const res = await fetch(`${BDD_API_URL}/pain/close/${painId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function getUserPainsByStatus(userId: string, status: 'actif' | 'fini') {
  try {
    const res = await fetch(`${BDD_API_URL}/pain/status/${userId}/${status}`);
    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
