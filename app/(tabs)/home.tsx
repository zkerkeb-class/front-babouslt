import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function HomeScreen() {
  const [user, setUser] = useState<{
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isPremium?: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        const decoded = jwtDecode<any>(token);
        setUser(decoded.body || decoded);
      }
    };
    fetchUser();
  }, []);

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-100 to-white">
      {/* Header */}
      <View className="rounded-b-3xl bg-blue-600 px-6 py-8 shadow-md">
        <Text className="mb-2 text-3xl font-extrabold text-white">Bienvenue 👋</Text>
        <Text className="text-lg text-blue-100">sur votre espace santé intelligent</Text>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-6">
        {/* Profil résumé */}
        <View className="mb-6 items-center rounded-2xl bg-white p-6 shadow">
          <View className="mb-2 h-16 w-16 flex-row items-center justify-center rounded-full bg-blue-200">
            <Text className="text-2xl font-bold text-blue-700">
              {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-800">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="mb-1 text-gray-500">{user?.email}</Text>
          {user?.isPremium && (
            <View className="mt-1 rounded-full bg-yellow-400 px-3 py-1">
              <Text className="text-xs font-bold text-white">PREMIUM</Text>
            </View>
          )}
        </View>
        {/* Boutons d'accès rapide */}
        <View className="space-y-4">
          <TouchableOpacity
            className="items-center rounded-xl bg-blue-600 py-4 shadow-md"
            onPress={() => router.push('/analyse')}>
            <Text className="text-lg font-bold text-white">Faire une analyse médicale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center rounded-xl border border-blue-200 bg-blue-100 py-4"
            onPress={() => router.push('/analyse')}>
            <Text className="text-lg font-bold text-blue-700">Voir l'historique</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center rounded-xl border border-gray-200 bg-gray-100 py-4"
            onPress={() => router.push('/settings')}>
            <Text className="text-lg font-bold text-gray-700">Paramètres</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
