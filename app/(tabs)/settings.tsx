import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const handleNotificationSettings = () => {
    Alert.alert('Notifications', 'Paramètres de notifications à venir');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Confidentialité', 'Paramètres de confidentialité à venir');
  };

  const handleAbout = () => {
    Alert.alert('À propos', 'Version 1.0.0\nDéveloppé avec React Native et Expo');
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        onPress: async () => {
          await AsyncStorage.removeItem('jwt');
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pb-6 pt-12">
          <Text className="text-3xl font-bold text-gray-800">Paramètres</Text>
          <Text className="mt-2 text-lg text-gray-600">Gérez vos préférences</Text>
        </View>

        {/* Settings Sections */}
        <View className="space-y-6">
          {/* Notifications */}
          <View className="rounded-2xl bg-white p-6 shadow-lg">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={handleNotificationSettings}>
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={24} color="#3b82f6" />
                <Text className="ml-4 text-lg font-semibold text-gray-800">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Privacy */}
          <View className="rounded-2xl bg-white p-6 shadow-lg">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={handlePrivacySettings}>
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark" size={24} color="#10b981" />
                <Text className="ml-4 text-lg font-semibold text-gray-800">Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* About */}
          <View className="rounded-2xl bg-white p-6 shadow-lg">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={handleAbout}>
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={24} color="#f59e0b" />
                <Text className="ml-4 text-lg font-semibold text-gray-800">À propos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="rounded-2xl bg-white p-6 shadow-lg">
            <View className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                <Ionicons name="medical" size={32} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Mon App</Text>
              <Text className="mt-1 text-gray-600">Version 1.0.0</Text>
              <Text className="mt-4 text-center text-gray-500">
                Application de santé et bien-être
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button minimaliste */}
        <View className="mb-8 mt-10 items-center">
          <TouchableOpacity
            className="rounded-xl border border-red-400 px-8 py-3"
            onPress={handleLogout}>
            <Text className="text-lg font-semibold text-red-500">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
