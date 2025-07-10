import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import StatsTab from '../../components/StatsTab';
import MetricsTab from '../../components/MetricsTab';

interface JwtPayload {
  body?: {
    isAdmin?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

type TabType = 'stats' | 'metrics';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const decoded: JwtPayload = jwtDecode(token);
        setIsAdmin(!!decoded.body?.isAdmin);
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-bold text-red-600">
          Accès refusé : réservé aux administrateurs.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* En-tête */}
      <View className="border-b border-gray-200 bg-white px-4 pb-4 pt-10">
        <Text className="mb-2 text-center text-2xl font-bold text-blue-700">
          Bienvenue sur la page Admin 👑
        </Text>
        {/* Onglets */}
        <View className="mt-4 flex-row rounded-lg bg-gray-100 p-1">
          <TouchableOpacity
            className={`flex-1 rounded-md px-4 py-3 ${activeTab === 'stats' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('stats')}>
            <Text
              className={`text-center font-semibold ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-600'}`}>
              📈 Statistiques
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-md px-4 py-3 ${activeTab === 'metrics' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('metrics')}>
            <Text
              className={`text-center font-semibold ${activeTab === 'metrics' ? 'text-blue-600' : 'text-gray-600'}`}>
              ⏱️ Métriques
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Contenu des onglets */}
      <View className="flex-1">{activeTab === 'stats' ? <StatsTab /> : <MetricsTab />}</View>
    </View>
  );
}
