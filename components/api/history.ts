import { BDD_API_URL } from '@env';

export async function getUserMedicalHistory(userId: string) {
  try {
    const response = await fetch(`${BDD_API_URL}history/${userId}`);
    return await response.json();
  } catch (error) {
    return { success: false, message: "Erreur lors de la récupération de l'historique" };
  }
}
