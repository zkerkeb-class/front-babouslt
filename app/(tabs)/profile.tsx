import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '../../components/api/user';
import { createSubscription, cancelSubscription } from '../../components/api/subscription';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  isPremium?: boolean;
  _id?: string;
  id?: string;
  stripeSubscriptionId?: string;
  aiUsageCount?: number;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      console.log('decoded', decoded);
      const userId = decoded.body?.id;
      if (!userId) return;
      const response = await getUserById(userId, token);
      if (response.success) {
        setUser(response.user || response);
      }
    } catch (error) {}
    setIsLoading(false);
  };

  const souscrireAbonnement = async () => {
    try {
      if (!user) return;
      const userId = user._id || user.id;
      if (!userId) {
        Alert.alert('Erreur', 'ID utilisateur non trouvé');
        return;
      }

      if (!user.email) {
        Alert.alert('Erreur', "Email utilisateur requis pour l'abonnement");
        return;
      }

      const subscriptionData = {
        userId,
        email: user.email,
        amount: 6.99,
        currency: 'eur',
      };

      const response = await createSubscription(subscriptionData);

      if (!response.success || !response.data) {
        Alert.alert('Erreur', response.message || "Erreur lors de la création de l'abonnement");
        return;
      }

      const { clientSecret } = response.data;
      if (!clientSecret) {
        Alert.alert('Erreur', 'Client secret non trouvé');
        return;
      }

      const initSheet = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Mon App',
      });

      if (initSheet.error) {
        Alert.alert('Erreur', initSheet.error.message);
        return;
      }

      const paymentResult = await presentPaymentSheet();
      if (paymentResult.error) {
        Alert.alert('Paiement annulé', paymentResult.error.message);
      } else {
        Alert.alert(
          'Succès',
          'Abonnement créé ! Votre profil sera mis à jour dans quelques secondes.'
        );
        // Attendre un peu pour que le webhook traite la mise à jour
        setTimeout(() => {
          fetchUserProfile(); // Rafraîchir le statut premium
        }, 3000);
      }
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  const arreterAbonnement = async () => {
    try {
      if (!user?.stripeSubscriptionId) {
        Alert.alert('Erreur', 'Aucun abonnement trouvé pour cet utilisateur');
        return;
      }

      Alert.alert(
        "Arrêter l'abonnement",
        "Êtes-vous sûr de vouloir arrêter votre abonnement premium ? Vous perdrez l'accès aux fonctionnalités premium à la fin de la période en cours.",
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Arrêter',
            style: 'destructive',
            onPress: async () => {
              try {
                if (!user?.stripeSubscriptionId) {
                  Alert.alert('Erreur', "ID d'abonnement non trouvé");
                  return;
                }
                await cancelSubscription(user.stripeSubscriptionId, true); // Annuler à la fin de la période
                Alert.alert(
                  'Succès',
                  'Votre abonnement sera arrêté à la fin de la période en cours.'
                );
                // Rafraîchir immédiatement pour voir le changement
                setTimeout(() => {
                  fetchUserProfile(); // Rafraîchir le profil
                }, 1000);
              } catch (error) {
                Alert.alert(
                  'Erreur',
                  error instanceof Error ? error.message : "Erreur lors de l'arrêt de l'abonnement"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Text className="text-lg text-gray-600">Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
        <ScrollView className="flex-1 px-6">
          <View className="items-center pb-8 pt-16">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-blue-500 shadow-lg">
              <Text className="text-3xl font-bold text-white">
                {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-2xl font-bold text-gray-800">
                {user?.firstName} {user?.lastName}
              </Text>
              {user?.isPremium && (
                <View className="ml-2 rounded-full bg-yellow-400 px-3 py-1">
                  <Text className="text-xs font-bold text-white">PREMIUM</Text>
                </View>
              )}
            </View>
            <Text className="mt-1 text-gray-500">{user?.email}</Text>
          </View>

          <View className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
            <View className="space-y-6">
              <ProfileRow label="Âge" value={user?.age ? `${user.age} ans` : '-'} />
              <ProfileRow label="Taille" value={user?.height ? `${user.height} cm` : '-'} />
              <ProfileRow label="Poids" value={user?.weight ? `${user.weight} kg` : '-'} />
              <ProfileRow
                label="Sexe"
                value={
                  user?.gender === 'male'
                    ? 'Homme'
                    : user?.gender === 'female'
                      ? 'Femme'
                      : user?.gender === 'other'
                        ? 'Autre'
                        : '-'
                }
              />
              <ProfileRow
                label="Requêtes IA restantes"
                value={user?.aiUsageCount !== undefined ? `${user.aiUsageCount}` : '-'}
                highlight
              />
            </View>
          </View>

          {/* Bouton abonnement premium si non premium */}
          {!user?.isPremium && (
            <View className="mt-8 items-center">
              <TouchableOpacity
                className="rounded-xl bg-yellow-400 px-8 py-4"
                onPress={souscrireAbonnement}>
                <Text className="text-lg font-bold text-white">
                  Souscrire à l&apos;abonnement Premium
                </Text>
              </TouchableOpacity>
              <Text className="mt-2 text-center text-sm text-gray-500">
                6.99€/mois - Paiement récurrent automatique
              </Text>
            </View>
          )}

          {/* Bouton arrêter abonnement si premium */}
          {user?.isPremium && (
            <View className="mt-8 items-center">
              <TouchableOpacity
                className="rounded-xl border border-red-400 px-6 py-3"
                onPress={arreterAbonnement}>
                <Text className="text-sm font-medium text-red-600">Arrêter l&apos;abonnement</Text>
              </TouchableOpacity>
              <Text className="mt-2 text-center text-xs text-gray-400">
                L&apos;abonnement sera arrêté à la fin de la période en cours
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </StripeProvider>
  );
}

function ProfileRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-4 last:border-b-0">
      <Text className="text-lg font-semibold text-gray-600">{label}</Text>
      <Text className={`text-lg font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </Text>
    </View>
  );
}
