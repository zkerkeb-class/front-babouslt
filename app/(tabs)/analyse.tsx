import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '../../components/api/user';
import { generateMedicalAnalysis } from '../../components/api/ia';
import { getUserMedicalHistory } from '../../components/api/history';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

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
}

export default function AnalyseScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [symptomes, setSymptomes] = useState('');
  const [niveauDouleur, setNiveauDouleur] = useState('');
  const [localisationDouleur, setLocalisationDouleur] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openHistoryIdx, setOpenHistoryIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      const userId = decoded.body?.id;
      if (!userId) return;
      const response = await getUserById(userId, token);
      if (response.success) {
        setUser(response.user || response);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  const handleSubmit = async () => {
    if (!symptomes || !niveauDouleur || !localisationDouleur) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!user) {
      Alert.alert('Erreur', 'Profil utilisateur non trouvé.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await generateMedicalAnalysis({
        userId: user._id || user.id || '',
        age: parseInt(user.age || '0'),
        sexe: user.gender === 'male' ? 'Male' : 'Female',
        taille: parseInt(user.height || '0'),
        poids: parseFloat(user.weight || '0'),
        symptomes,
        niveauDouleur: parseInt(niveauDouleur),
        localisationDouleur,
      });
      if (res.success) {
        setResult(res.data.response);
        console.log(res.data.response);
      } else {
        Alert.alert('Erreur', res.message || "Impossible d'obtenir l'analyse médicale.");
      }
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'obtenir l'analyse médicale.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await getUserMedicalHistory(user._id || user.id || '');
      if (res.success && res.data?.analyses) {
        setHistory(res.data.analyses);
      } else {
        setHistory([]);
      }
    } catch (e) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistory = () => {
    setHistoryVisible(true);
    fetchHistory();
  };
  const closeHistory = () => setHistoryVisible(false);

  // Ajout : test si l'utilisateur a encore des crédits IA
  const aiUsageCount = (user as any)?.aiUsageCount;
  const isOutOfAI = aiUsageCount !== undefined && aiUsageCount <= 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gradient-to-b from-blue-50 to-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-8">
        <Text className="text-3xl font-extrabold text-blue-700">Analyse médicale</Text>
        <TouchableOpacity onPress={openHistory} className="ml-4 rounded-full bg-blue-100 p-2">
          <Text className="font-bold text-blue-700">Historique</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={historyVisible} animationType="slide" onRequestClose={closeHistory}>
        <View className="flex-1 bg-white px-4 pt-12">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-blue-700">Historique des analyses</Text>
            <Pressable onPress={closeHistory} className="p-2">
              <Text className="text-lg font-bold text-blue-700">Fermer</Text>
            </Pressable>
          </View>
          {loadingHistory ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : history.length === 0 ? (
            <Text className="mt-8 text-center text-gray-500">Aucune analyse trouvée.</Text>
          ) : (
            <ScrollView>
              {history.map((item, idx) => {
                // Découpage et filtrage des diagnostics comme dans le résultat IA principal
                const diagnostics = (item.responseData?.response || '')
                  .split('🔹')
                  .filter(Boolean)
                  .map((diag) => {
                    const titreMatch = diag.match(/\d+\.\s*(\[([^\]]+)\]|([^\n]+))/i);
                    let titre = '';
                    if (titreMatch) {
                      titre = titreMatch[2] || titreMatch[3] || '';
                      titre = titre.trim();
                    }
                    const symptomes =
                      diag.match(/Sympt[oô]mes?\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                    const cause = diag.match(/Cause\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                    const traitement = diag.match(/Traitement\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                    const tests = diag.match(/Tests?\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                    const titreEstGenerique = /^Diagnostic \d+$/i.test(titre);
                    if (
                      (titreEstGenerique && !(symptomes || cause || traitement || tests)) ||
                      !(titre || symptomes || cause || traitement || tests)
                    )
                      return null;
                    return { titre, symptomes, cause, traitement, tests };
                  })
                  .filter(Boolean);
                if (diagnostics.length === 0) return null;
                const isOpen = openHistoryIdx === idx;
                return (
                  <View key={item._id || idx} className="mb-2">
                    <TouchableOpacity
                      className="flex-row items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3"
                      onPress={() => setOpenHistoryIdx(isOpen ? null : idx)}
                      activeOpacity={0.8}>
                      <View className="flex-1">
                        <Text className="mb-0.5 text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                        <Text
                          className="text-sm font-bold text-blue-700"
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {item.requestData?.symptomes?.slice(0, 60) || 'Analyse'}
                        </Text>
                      </View>
                      {isOpen ? (
                        <ChevronUpIcon size={20} color="#2563eb" />
                      ) : (
                        <ChevronDownIcon size={20} color="#2563eb" />
                      )}
                    </TouchableOpacity>
                    {isOpen && (
                      <View className="mb-2 mt-2 px-2">
                        {diagnostics.map((diag, dIdx) => (
                          <View key={dIdx} className="mb-2">
                            {diag.titre ? (
                              <Text className="mb-1 text-base font-bold text-blue-700">
                                {diag.titre}
                              </Text>
                            ) : null}
                            {diag.symptomes ? (
                              <Text className="mb-1">
                                <Text className="font-semibold">Symptômes :</Text> {diag.symptomes}
                              </Text>
                            ) : null}
                            {diag.cause ? (
                              <Text className="mb-1">
                                <Text className="font-semibold">Cause :</Text> {diag.cause}
                              </Text>
                            ) : null}
                            {diag.traitement ? (
                              <Text className="mb-1">
                                <Text className="font-semibold">Traitement :</Text>{' '}
                                {diag.traitement}
                              </Text>
                            ) : null}
                            {diag.tests ? (
                              <Text>
                                <Text className="font-semibold">Tests :</Text> {diag.tests}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="mb-8 items-center">
          <Text className="mb-2 text-3xl font-extrabold text-blue-700">Analyse médicale</Text>
          <Text className="text-center text-base text-gray-500">
            Obtenez une analyse préliminaire de vos symptômes en quelques secondes.
          </Text>
        </View>
        <View className="space-y-6 rounded-2xl bg-white p-6 shadow-lg">
          <View>
            <Text className="mb-1 text-lg font-semibold text-gray-700">Symptômes</Text>
            <TextInput
              className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-base"
              value={symptomes}
              onChangeText={setSymptomes}
              placeholder="Décrivez vos symptômes"
              multiline
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View>
            <Text className="mb-1 text-lg font-semibold text-gray-700">
              Niveau de douleur (1-10)
            </Text>
            <TextInput
              className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-base"
              value={niveauDouleur}
              onChangeText={setNiveauDouleur}
              placeholder="Ex: 5"
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View>
            <Text className="mb-1 text-lg font-semibold text-gray-700">
              Localisation de la douleur
            </Text>
            <TextInput
              className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-base"
              value={localisationDouleur}
              onChangeText={setLocalisationDouleur}
              placeholder="Ex: genou droit, bas du dos..."
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity
            className={`mt-2 rounded-xl bg-blue-600 py-4 shadow-md active:bg-blue-700 ${loading || isOutOfAI ? 'opacity-60' : ''}`}
            onPress={handleSubmit}
            disabled={loading || isOutOfAI}>
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#fff" />
                <Text className="ml-2 text-lg font-bold text-white">Analyse en cours...</Text>
              </View>
            ) : (
              <Text className="text-center text-lg font-bold text-white">Analyser</Text>
            )}
          </TouchableOpacity>
          {isOutOfAI && (
            <Text className="mt-4 text-center text-base font-semibold text-red-500">
              Vous avez atteint la limite d'utilisations IA. Passez Premium pour continuer !
            </Text>
          )}
        </View>
        {result && (
          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-blue-700">Résultat IA</Text>
            {result
              .split('🔹')
              .filter(Boolean)
              .map((diag, idx) => {
                // Extraction du titre et des sections
                const titreMatch = diag.match(/\d+\.\s*(\[([^\]]+)\]|([^\n]+))/i);
                let titre = '';
                if (titreMatch) {
                  titre = titreMatch[2] || titreMatch[3] || '';
                  titre = titre.trim();
                }
                const symptomes = diag.match(/Sympt[oô]mes?\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                const cause = diag.match(/Cause\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                const traitement = diag.match(/Traitement\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                const tests = diag.match(/Tests?\s*:\s*([^\n]*)/i)?.[1]?.trim() || '';
                // On ignore les diagnostics génériques sans contenu utile
                const titreEstGenerique = /^Diagnostic \d+$/i.test(titre);
                if (
                  (titreEstGenerique && !(symptomes || cause || traitement || tests)) ||
                  !(titre || symptomes || cause || traitement || tests)
                )
                  return null;
                return (
                  <View
                    key={idx}
                    className="mb-4 rounded-2xl border border-blue-100 bg-white p-4 shadow">
                    {titre ? (
                      <Text className="mb-1 text-lg font-bold text-blue-700">{titre}</Text>
                    ) : null}
                    {symptomes ? (
                      <Text className="mb-1">
                        <Text className="font-semibold">Symptômes :</Text> {symptomes}
                      </Text>
                    ) : null}
                    {cause ? (
                      <Text className="mb-1">
                        <Text className="font-semibold">Cause :</Text> {cause}
                      </Text>
                    ) : null}
                    {traitement ? (
                      <Text className="mb-1">
                        <Text className="font-semibold">Traitement :</Text> {traitement}
                      </Text>
                    ) : null}
                    {tests ? (
                      <Text>
                        <Text className="font-semibold">Tests :</Text> {tests}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
