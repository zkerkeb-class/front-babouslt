// Configuration des variables d'environnement avec valeurs par défaut
// Ces valeurs peuvent être surchargées par un fichier .env

export const ENV_CONFIG = {
  AUTH_API_URL: process.env.AUTH_API_URL || 'http://10.0.2.2:3001/api/',
  PAYMENT_API_URL: process.env.PAYMENT_API_URL || 'http://10.0.2.2:3002/api/',
  BDD_API_URL: process.env.BDD_API_URL || 'http://10.0.2.2:3003/api/',
  IA_API_URL: process.env.IA_API_URL || 'http://10.0.2.2:3004/api/',
};

// Fonction pour obtenir une variable d'environnement
export const getEnvVar = (key: keyof typeof ENV_CONFIG): string => {
  return ENV_CONFIG[key];
};

// Fonction pour afficher la configuration (debug)
export const logConfig = () => {
  console.log('Configuration des APIs:', ENV_CONFIG);
};
