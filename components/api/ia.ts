import { IA_API_URL } from '@env';

export async function generateMedicalAnalysis(analysisData: {
  userId: string;
  age: number;
  sexe: string;
  taille: number;
  poids: number;
  symptomes: string;
  niveauDouleur: number;
  localisationDouleur: string;
}) {
  try {
    console.log(analysisData);
    const response = await fetch(`${IA_API_URL}ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisData),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la génération de l'analyse médicale:", error);
    return { success: false, message: "Erreur lors de la génération de l'analyse médicale" };
  }
}
