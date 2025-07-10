import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { login as loginApi } from '../../components/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginApi(email, password);
      if (response.success) {
        if (response.token) {
          await AsyncStorage.setItem('jwt', response.token);
        }
        Alert.alert('Succès', 'Connexion réussie !');
        router.replace('/home');
      } else {
        Alert.alert('Erreur', response.message || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6">
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="mb-12 items-center">
            <Text className="mb-2 text-4xl font-bold text-gray-800">Connexion</Text>
            <Text className="text-center text-lg text-gray-600">Connectez-vous à votre compte</Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Email</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Mot de passe</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-6 rounded-xl py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 active:bg-blue-700'
              }`}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text className="text-center text-lg font-bold text-white">
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity className="items-center py-2">
              <Text className="text-lg font-semibold text-blue-600">Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="mt-8 flex-row items-center justify-center py-4">
            <Text className="text-lg text-gray-600">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-lg font-bold text-blue-600">S&apos;inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
