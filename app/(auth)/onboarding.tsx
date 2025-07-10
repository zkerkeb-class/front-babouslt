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
import { updateProfile } from '../../components/api/user';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const genders = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Autre', value: 'other' },
];

export default function OnboardingScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [isLoading, setIsLoading] = useState(false);

  const handleOnboarding = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !gender) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        setIsLoading(false);
        return;
      }
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      const userId = decoded.body?.id;
      console.log(userId);
      if (!userId) {
        Alert.alert('Erreur', "Impossible de récupérer l'ID utilisateur");
        setIsLoading(false);
        return;
      }
      const response = await updateProfile(
        userId,
        {
          firstName,
          lastName,
          age,
          height,
          weight,
          gender,
        },
        token
      );
      if (response.success) {
        Alert.alert('Succès', 'Profil complété !');
        router.replace('/home');
      } else {
        console.log(response);
        Alert.alert('Erreur', response.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-yellow-50 to-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6">
        <View className="flex-1 justify-center">
          <View className="mb-12 items-center">
            <Text className="mb-2 text-4xl font-bold text-gray-800">Complétez votre profil</Text>
            <Text className="text-center text-lg text-gray-600">
              Quelques infos pour personnaliser votre expérience
            </Text>
          </View>
          <View className="space-y-6">
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Prénom</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre prénom"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Nom</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre nom"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Âge</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre âge"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Taille (cm)</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre taille en cm"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Poids (kg)</Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg"
                placeholder="Votre poids en kg"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
            <View>
              <Text className="mb-2 text-lg font-semibold text-gray-700">Sexe</Text>
              <View className="flex-row space-x-4">
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    className={`rounded-xl border px-4 py-2 ${gender === g.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}
                    onPress={() => setGender(g.value)}>
                    <Text className={gender === g.value ? 'font-bold text-white' : 'text-gray-700'}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              className={`mt-6 rounded-xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-yellow-500 active:bg-yellow-600'}`}
              onPress={handleOnboarding}
              disabled={isLoading}>
              <Text className="text-center text-lg font-bold text-white">
                {isLoading ? 'Enregistrement...' : 'Terminer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
