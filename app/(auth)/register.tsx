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
import { register as registerApi } from '../../components/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMail } from '../../components/api/mail';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setIsLoading(true);
    try {
      const response = await registerApi(email, password); // On n'envoie que email et password
      if (response.success) {
        if (response.token) {
          await sendMail(email);
          await AsyncStorage.setItem('jwt', response.token);
        }
        Alert.alert('Succès', 'Inscription réussie !');
        router.replace('/onboarding');
      } else {
        Alert.alert('Erreur', response.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-green-50 to-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6">
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="mb-12 items-center">
            <Text className="mb-2 text-4xl font-bold text-gray-800">Inscription</Text>
            <Text className="text-center text-lg text-gray-600">Créez votre compte</Text>
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
            {/* Confirm Password Input */}
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">
                Confirmer le mot de passe
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {/* Register Button */}
            <TouchableOpacity
              className={`mt-6 rounded-xl py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-green-600 active:bg-green-700'
              }`}
              onPress={handleRegister}
              disabled={isLoading}>
              <Text className="text-center text-lg font-bold text-white">
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Login Link */}
          <View className="mt-8 flex-row items-center justify-center py-4">
            <Text className="text-lg text-gray-600">Déjà un compte ? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-lg font-bold text-green-600">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
