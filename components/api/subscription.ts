import AsyncStorage from '@react-native-async-storage/async-storage';
import { PAYMENT_API_URL } from '@env';

export interface SubscriptionRequest {
  userId: string;
  email: string;
  amount?: number;
  currency?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    clientSecret?: string;
    status: string;
  };
  message?: string;
}

export const createSubscription = async (
  subscriptionData: SubscriptionRequest
): Promise<SubscriptionResponse> => {
  try {
    const token = await AsyncStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${PAYMENT_API_URL}subscriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la création de l'abonnement");
    }

    return data;
  } catch (error) {
    console.error('Erreur création abonnement:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (
  subscriptionId: string
): Promise<SubscriptionResponse> => {
  try {
    const token = await AsyncStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${PAYMENT_API_URL}subscriptions/${subscriptionId}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération du statut');
    }

    return data;
  } catch (error) {
    console.error('Erreur statut abonnement:', error);
    throw error;
  }
};

export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<SubscriptionResponse> => {
  try {
    console.log(`Tentative d'annulation de l'abonnement: ${subscriptionId}`);
    console.log(`URL: ${PAYMENT_API_URL}subscriptions/${subscriptionId}/cancel`);

    const token = await AsyncStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    console.log('Token récupéré, préparation de la requête...');

    const requestBody = { cancelAtPeriodEnd };
    console.log('Body de la requête:', requestBody);

    const response = await fetch(`${PAYMENT_API_URL}subscriptions/${subscriptionId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Réponse du serveur: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur HTTP:', errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Données reçues:`, data);

    return data;
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    throw error;
  }
};

export const getSubscription = async (subscriptionId: string): Promise<SubscriptionResponse> => {
  try {
    const token = await AsyncStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${PAYMENT_API_URL}subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération de l'abonnement");
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    throw error;
  }
};
