import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { getStats, StatsData } from './api/stats';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = 'bg-blue-500' }) => (
  <View className={`${color} m-2 min-w-[150px] flex-1 rounded-lg p-4`}>
    <Text className="mb-1 text-sm font-medium text-white">{title}</Text>
    <Text className="text-2xl font-bold text-white">{value.toLocaleString()}</Text>
    {subtitle && <Text className="mt-1 text-xs text-white opacity-80">{subtitle}</Text>}
  </View>
);

interface StatusCardProps {
  title: string;
  data: Array<{ _id: string; count: number }>;
  color?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, data, color = 'bg-gray-100' }) => (
  <View className={`${color} m-2 rounded-lg p-4`}>
    <Text className="mb-3 text-lg font-bold text-gray-800">{title}</Text>
    {data.map((item, index) => (
      <View
        key={index}
        className="flex-row items-center justify-between border-b border-gray-200 py-2">
        <Text className="font-medium capitalize text-gray-700">{item._id}</Text>
        <Text className="font-bold text-gray-800">{item.count}</Text>
      </View>
    ))}
  </View>
);

export default function StatsTab() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="mb-2 text-lg font-bold text-red-600">Erreur</Text>
        <Text className="mb-4 text-center text-gray-600">{error}</Text>
        <View className="rounded-lg bg-blue-500 px-6 py-3">
          <Text className="font-bold text-white" onPress={fetchStats}>
            Réessayer
          </Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="p-4">
        {/* En-tête */}
        <View className="mb-6">
          <Text className="mb-2 text-2xl font-bold text-gray-800">📊 Statistiques</Text>
          <Text className="text-gray-600">
            Dernière mise à jour : {new Date(stats.timestamp).toLocaleString('fr-FR')}
          </Text>
        </View>

        {/* Statistiques Utilisateurs */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-800">👥 Utilisateurs</Text>
          <View className="flex-row flex-wrap">
            <StatCard
              title="Total"
              value={stats.users.total}
              subtitle="utilisateurs inscrits"
              color="bg-blue-500"
            />
            <StatCard
              title="Premium"
              value={stats.users.premium}
              subtitle="utilisateurs premium"
              color="bg-green-500"
            />
            <StatCard
              title="Gratuits"
              value={stats.users.free}
              subtitle="utilisateurs gratuits"
              color="bg-gray-500"
            />
          </View>
        </View>

        {/* Statistiques Analyses */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-800">🔬 Analyses Médicales</Text>
          <View className="flex-row flex-wrap">
            <StatCard
              title="Total"
              value={stats.analyses.total}
              subtitle="analyses effectuées"
              color="bg-purple-500"
            />
            <StatCard
              title="24h"
              value={stats.analyses.last24h}
              subtitle="dernières 24h"
              color="bg-orange-500"
            />
          </View>
        </View>

        {/* Statistiques Abonnements */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-800">💳 Abonnements</Text>
          <View className="flex-row flex-wrap">
            <StatCard
              title="Actifs"
              value={stats.subscriptions.active}
              subtitle="abonnements en cours"
              color="bg-emerald-500"
            />
          </View>
        </View>

        {/* Détails des Abonnements */}
        {stats.subscriptions.byStatus.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-bold text-gray-800">
              📈 Répartition des Abonnements
            </Text>
            <StatusCard title="Par Statut" data={stats.subscriptions.byStatus} color="bg-white" />
          </View>
        )}

        {/* Évolution des Analyses (7 derniers jours) */}
        {stats.analyses.last7Days.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-bold text-gray-800">📅 Évolution (7 jours)</Text>
            <View className="rounded-lg bg-white p-4">
              {stats.analyses.last7Days.map((day, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between border-b border-gray-100 py-2">
                  <Text className="font-medium text-gray-700">
                    {new Date(day._id).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </Text>
                  <Text className="font-bold text-gray-800">{day.count} analyses</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
