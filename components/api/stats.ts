import AsyncStorage from '@react-native-async-storage/async-storage';
import { METRICS_API_URL } from '@env';

// Interface pour les statistiques
export interface StatsData {
  users: {
    total: number;
    premium: number;
    free: number;
  };
  analyses: {
    total: number;
    last24h: number;
    last7Days: Array<{ _id: string; count: number }>;
  };
  subscriptions: {
    active: number;
    byStatus: Array<{ _id: string; count: number }>;
  };
  timestamp: string;
}

export interface UserStats {
  total: number;
  premium: number;
  free: number;
  newLast24h: number;
  newLast7Days: number;
}

export interface AnalysisStats {
  total: number;
  last24h: number;
  last7Days: number;
  byDay: Array<{ _id: string; count: number }>;
}

export interface SubscriptionStats {
  active: number;
  total: number;
  byStatus: Array<{ _id: string; count: number }>;
  newLast24h: number;
}

// Fonction pour récupérer toutes les statistiques
export async function getStats(): Promise<StatsData> {
  const token = await AsyncStorage.getItem('jwt');

  const response = await fetch(`${METRICS_API_URL}stats/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// Fonction pour récupérer les statistiques des utilisateurs
export async function getUserStats(): Promise<UserStats> {
  const token = await AsyncStorage.getItem('jwt');

  const response = await fetch(`${METRICS_API_URL}stats/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// Fonction pour récupérer les statistiques des analyses
export async function getAnalysisStats(): Promise<AnalysisStats> {
  const token = await AsyncStorage.getItem('jwt');

  const response = await fetch(`${METRICS_API_URL}stats/analyses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

// Fonction pour récupérer les statistiques des abonnements
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const token = await AsyncStorage.getItem('jwt');

  const response = await fetch(`${METRICS_API_URL}stats/subscriptions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}
