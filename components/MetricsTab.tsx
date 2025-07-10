import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ENV_CONFIG, logConfig } from '../config/env';

interface ServiceMetric {
  name: string;
  url: string;
  status: 'OK' | 'Erreur' | 'En cours';
  responseTime: number;
  lastCheck: Date;
  message: string;
}

const SERVICES = [
  {
    name: 'AuthService',
    url: ENV_CONFIG.AUTH_API_URL + 'health',
    description: 'Authentification et statistiques',
  },
  {
    name: 'PaymentService',
    url: ENV_CONFIG.PAYMENT_API_URL + 'health',
    description: 'Gestion des paiements Stripe',
  },
  {
    name: 'IAService',
    url: ENV_CONFIG.IA_API_URL + 'health',
    description: 'Intelligence artificielle',
  },
  {
    name: 'BDDService',
    url: ENV_CONFIG.BDD_API_URL + 'health',
    description: 'Base de données et historique',
  },
];

// Log de debug pour vérifier les URLs
console.log(
  'Services configurés:',
  SERVICES.map((s) => ({ name: s.name, url: s.url }))
);

const MetricCard: React.FC<{ metric: ServiceMetric }> = ({ metric }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500';
      case 'Erreur':
        return 'bg-red-500';
      case 'En cours':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OK':
        return '🟢 Opérationnel';
      case 'Erreur':
        return '🔴 Erreur';
      case 'En cours':
        return '🟡 En cours';
      default:
        return '⚪ Inconnu';
    }
  };

  return (
    <View className="m-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{metric.name}</Text>
          <Text className="mt-1 text-sm text-gray-600">
            {SERVICES.find((s) => s.name === metric.name)?.description}
          </Text>
        </View>
        <View className={`rounded-full px-3 py-1 ${getStatusColor(metric.status)}`}>
          <Text className="text-xs font-semibold text-white">{getStatusText(metric.status)}</Text>
        </View>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600">Temps de réponse:</Text>
        <Text
          className={`font-bold ${metric.responseTime < 500 ? 'text-green-600' : metric.responseTime < 1000 ? 'text-yellow-600' : 'text-red-600'}`}>
          {metric.responseTime} ms
        </Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600">Dernière vérification:</Text>
        <Text className="text-sm text-gray-800">
          {metric.lastCheck.toLocaleTimeString('fr-FR')}
        </Text>
      </View>

      {metric.message && (
        <View className="mt-2 rounded bg-gray-50 p-2">
          <Text className="text-xs text-gray-600">{metric.message}</Text>
        </View>
      )}
    </View>
  );
};

export default function MetricsTab() {
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    console.log('Début de la vérification des services...');

    const results = await Promise.all(
      SERVICES.map(async (service) => {
        const start = Date.now();
        const metric: ServiceMetric = {
          name: service.name,
          url: service.url,
          status: 'En cours',
          responseTime: 0,
          lastCheck: new Date(),
          message: '',
        };

        try {
          console.log(`Test de ${service.name} sur ${service.url}`);

          const response = await fetch(service.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // Timeout de 10 secondes
            signal: AbortSignal.timeout(10000),
          });

          const data = await response.json();
          const duration = Date.now() - start;

          metric.status = data.success ? 'OK' : 'Erreur';
          metric.responseTime = duration;
          metric.message = data.message || 'Service accessible';

          console.log(`${service.name}: ${metric.status} (${duration}ms)`);
        } catch (err) {
          const duration = Date.now() - start;
          metric.status = 'Erreur';
          metric.responseTime = duration;

          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              metric.message = 'Timeout - Service injoignable';
            } else {
              metric.message = `Erreur: ${err.message}`;
            }
          } else {
            metric.message = 'Service injoignable';
          }

          console.log(`${service.name}: Erreur - ${metric.message}`);
        }

        return metric;
      })
    );

    setMetrics(results);
    setRefreshing(false);
    setLoading(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const getAverageResponseTime = () => {
    const validMetrics = metrics.filter((m) => m.status === 'OK');
    if (validMetrics.length === 0) return 0;
    return Math.round(
      validMetrics.reduce((sum, m) => sum + m.responseTime, 0) / validMetrics.length
    );
  };

  const getOperationalServices = () => {
    return metrics.filter((m) => m.status === 'OK').length;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Vérification des services...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="p-4">
        {/* En-tête avec statistiques globales */}
        <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="mb-3 text-xl font-bold text-gray-800">📊 Vue d&apos;ensemble</Text>

          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Services opérationnels:</Text>
            <Text className="font-bold text-green-600">
              {getOperationalServices()}/{metrics.length}
            </Text>
          </View>

          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">Temps de réponse moyen:</Text>
            <Text className="font-bold text-blue-600">{getAverageResponseTime()} ms</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Dernière vérification:</Text>
            <Text className="text-gray-800">{new Date().toLocaleString('fr-FR')}</Text>
          </View>
        </View>

        {/* Bouton de rafraîchissement manuel */}
        <TouchableOpacity
          className="mb-4 rounded-lg bg-blue-500 p-3"
          onPress={onRefresh}
          disabled={refreshing}>
          <Text className="text-center font-semibold text-white">
            {refreshing ? 'Vérification...' : '🔄 Rafraîchir les métriques'}
          </Text>
        </TouchableOpacity>

        {/* Métriques individuelles */}
        <Text className="mb-3 text-lg font-bold text-gray-800">🔍 Services individuels</Text>

        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}

        {/* Légende */}
        <View className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="mb-2 text-sm font-semibold text-gray-800">Légende:</Text>
          <View className="mb-1 flex-row items-center">
            <View className="mr-2 h-3 w-3 rounded-full bg-green-500" />
            <Text className="text-sm text-gray-600">Opérationnel (&lt; 500ms)</Text>
          </View>
          <View className="mb-1 flex-row items-center">
            <View className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
            <Text className="text-sm text-gray-600">Lent (500-1000ms)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="mr-2 h-3 w-3 rounded-full bg-red-500" />
            <Text className="text-sm text-gray-600">Très lent (&gt; 1000ms)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
