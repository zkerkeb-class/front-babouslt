import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import {
  getUserPains,
  createPain,
  addPainEvolution,
  getPainDetail,
  closePain,
  getUserPainsByStatus,
} from '../../components/api/pain';

interface Pain {
  _id: string;
  symptomes: string;
  localisation: string;
  cause?: string;
  dateDebut: string;
  intensiteDouleur: number;
  status: 'actif' | 'fini';
  dateFin?: string;
  evolutions: Array<{
    date: string;
    note?: string;
    intensite?: number;
    symptomes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function PainsScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activePains, setActivePains] = useState<Pain[]>([]);
  const [finishedPains, setFinishedPains] = useState<Pain[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalPain, setModalPain] = useState<Pain | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'actif' | 'fini'>('actif');
  const [form, setForm] = useState({
    symptomes: '',
    localisation: '',
    cause: '',
    dateDebut: '',
    intensiteDouleur: 5,
  });
  const [evolution, setEvolution] = useState({ note: '', intensite: '', symptomes: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        const decoded = jwtDecode<any>(token);
        console.log('Decoded token:', decoded);
        setUserId(decoded.body?.id || decoded.id || decoded._id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchPains();
  }, [userId]);

  const fetchPains = async () => {
    setLoading(true);
    if (!userId) return;

    // Récupérer les douleurs actives
    const activeRes = await getUserPainsByStatus(userId, 'actif');
    if (activeRes.success && activeRes.data && activeRes.data.data) {
      setActivePains(Array.isArray(activeRes.data.data) ? activeRes.data.data : []);
    } else {
      setActivePains([]);
    }

    // Récupérer les douleurs finies
    const finishedRes = await getUserPainsByStatus(userId, 'fini');
    if (finishedRes.success && finishedRes.data && finishedRes.data.data) {
      setFinishedPains(Array.isArray(finishedRes.data.data) ? finishedRes.data.data : []);
    } else {
      setFinishedPains([]);
    }

    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.symptomes || !form.localisation || !form.dateDebut) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validation de la date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.dateDebut)) {
      Alert.alert('Erreur', 'Format de date incorrect. Utilisez AAAA-MM-JJ (ex: 2024-01-15)');
      return;
    }

    const selectedDate = new Date(form.dateDebut);
    const today = new Date();
    if (selectedDate > today) {
      Alert.alert('Erreur', 'La date de début ne peut pas être dans le futur.');
      return;
    }

    // Validation de la longueur des champs
    if (form.symptomes.length < 5) {
      Alert.alert(
        'Erreur',
        'Veuillez décrire vos symptômes plus en détail (minimum 5 caractères).'
      );
      return;
    }

    if (form.localisation.length < 3) {
      Alert.alert('Erreur', 'Veuillez préciser la localisation (minimum 3 caractères).');
      return;
    }

    const res = await createPain({ ...form, userId });
    if (res.success) {
      setShowCreate(false);
      setForm({ symptomes: '', localisation: '', cause: '', dateDebut: '', intensiteDouleur: 5 });
      fetchPains();
      Alert.alert('Succès', 'Douleur enregistrée avec succès !');
    } else {
      Alert.alert('Erreur', res.message || 'Erreur lors de la création');
    }
  };

  const openPainDetail = async (painId: string) => {
    try {
      const res = await getPainDetail(painId);
      console.log('Pain detail response:', res);
      if (res.success && res.data && res.data.data) {
        setModalPain(res.data.data);
      } else if (res.success && res.data) {
        setModalPain(res.data);
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les détails de la douleur');
      }
    } catch (error) {
      console.error('Error fetching pain detail:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les détails de la douleur');
    }
  };

  const handleClosePain = async (painId: string) => {
    Alert.alert('Clôturer la douleur', 'Êtes-vous sûr de vouloir clôturer cette douleur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Clôturer',
        style: 'destructive',
        onPress: async () => {
          const res = await closePain(painId);
          if (res.success) {
            fetchPains();
            Alert.alert('Succès', 'Douleur clôturée avec succès');
          } else {
            Alert.alert('Erreur', res.message || 'Erreur lors de la clôture');
          }
        },
      },
    ]);
  };

  const handleAddEvolution = async () => {
    if (!modalPain) return;
    if (!evolution.note || !evolution.intensite || !evolution.symptomes) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }
    const res = await addPainEvolution(modalPain._id, evolution);
    if (res.success) {
      setEvolution({ note: '', intensite: '', symptomes: '' });
      setModalPain(null);
      fetchPains();
    } else {
      Alert.alert('Erreur', res.message || "Erreur lors de l'ajout");
    }
  };

  // S'assurer que les tableaux sont valides
  const activePainsArray = Array.isArray(activePains) ? activePains : [];
  const finishedPainsArray = Array.isArray(finishedPains) ? finishedPains : [];

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fonction pour suggérer la date d'aujourd'hui
  const suggestTodayDate = () => {
    setForm((f) => ({ ...f, dateDebut: getTodayDate() }));
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white px-4 pt-8">
      <Text className="mb-4 text-center text-2xl font-bold text-blue-700">
        Suivi de mes douleurs
      </Text>
      {/* FAB Nouvelle douleur */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 z-50 h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg active:opacity-80"
        onPress={() => setShowCreate(true)}
        activeOpacity={0.85}
        style={{ elevation: 8 }}>
        <Text className="text-3xl font-bold text-white">+</Text>
      </TouchableOpacity>

      {/* Onglets */}
      <View className="mb-4 flex-row rounded-lg bg-white p-1">
        <TouchableOpacity
          className={`flex-1 rounded-md px-4 py-2 ${activeTab === 'actif' ? 'bg-blue-600' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('actif')}>
          <Text
            className={`text-center font-semibold ${activeTab === 'actif' ? 'text-white' : 'text-gray-600'}`}>
            Actives ({activePainsArray.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-md px-4 py-2 ${activeTab === 'fini' ? 'bg-blue-600' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('fini')}>
          <Text
            className={`text-center font-semibold ${activeTab === 'fini' ? 'text-white' : 'text-gray-600'}`}>
            Finies ({finishedPainsArray.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="space-y-3">
        {activeTab === 'actif' ? (
          activePainsArray.length > 0 ? (
            activePainsArray.map((pain) => (
              <TouchableOpacity
                key={pain._id}
                className="rounded-xl border border-blue-100 bg-white p-4 shadow"
                onPress={() => openPainDetail(pain._id)}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="mb-1 font-bold text-blue-700">{pain.localisation}</Text>
                    <Text className="text-gray-700">
                      {pain.symptomes.slice(0, 60)}
                      {pain.symptomes.length > 60 ? '...' : ''}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <Text className="mr-2 text-xs text-gray-400">
                        Début : {new Date(pain.dateDebut).toLocaleDateString()}
                      </Text>
                      <View
                        className={`rounded-full px-2 py-1 ${
                          pain.intensiteDouleur <= 3
                            ? 'bg-green-100'
                            : pain.intensiteDouleur <= 6
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                        }`}>
                        <Text
                          className={`text-xs font-bold ${
                            pain.intensiteDouleur <= 3
                              ? 'text-green-700'
                              : pain.intensiteDouleur <= 6
                                ? 'text-yellow-700'
                                : 'text-red-700'
                          }`}>
                          {pain.intensiteDouleur}/10
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="rounded bg-red-500 px-3 py-1"
                    onPress={() => handleClosePain(pain._id)}>
                    <Text className="text-xs text-white">Clôturer</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="mt-8 text-center text-gray-400">
              {loading ? 'Chargement...' : 'Aucune douleur active.'}
            </Text>
          )
        ) : finishedPainsArray.length > 0 ? (
          finishedPainsArray.map((pain) => (
            <TouchableOpacity
              key={pain._id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow"
              onPress={() => openPainDetail(pain._id)}>
              <Text className="mb-1 font-bold text-gray-600">{pain.localisation}</Text>
              <Text className="text-gray-500">
                {pain.symptomes.slice(0, 60)}
                {pain.symptomes.length > 60 ? '...' : ''}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Text className="mr-2 text-xs text-gray-400">
                  Début : {new Date(pain.dateDebut).toLocaleDateString()}
                  {pain.dateFin && ` • Fin : ${new Date(pain.dateFin).toLocaleDateString()}`}
                </Text>
                <View
                  className={`rounded-full px-2 py-1 ${
                    pain.intensiteDouleur <= 3
                      ? 'bg-green-100'
                      : pain.intensiteDouleur <= 6
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}>
                  <Text
                    className={`text-xs font-bold ${
                      pain.intensiteDouleur <= 3
                        ? 'text-green-700'
                        : pain.intensiteDouleur <= 6
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}>
                    {pain.intensiteDouleur}/10
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="mt-8 text-center text-gray-400">
            {loading ? 'Chargement...' : 'Aucune douleur finie.'}
          </Text>
        )}
      </ScrollView>
      {/* Modal création */}
      <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="bg-blue-600 px-6 pb-4 pt-12">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text className="text-lg text-white">Annuler</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">Nouvelle douleur</Text>
              <TouchableOpacity onPress={handleCreate}>
                <Text className="text-lg font-semibold text-white">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-6 py-6">
            {/* Indicateur de progression */}
            <View className="mb-6">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-600">Progression</Text>
                <Text className="text-sm font-medium text-blue-600">
                  {[form.localisation, form.symptomes, form.dateDebut].filter(Boolean).length}/3
                </Text>
              </View>
              <View className="flex-row space-x-1">
                <View
                  className={`h-2 flex-1 rounded-full ${form.localisation ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
                <View
                  className={`h-2 flex-1 rounded-full ${form.symptomes ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
                <View
                  className={`h-2 flex-1 rounded-full ${form.dateDebut ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              </View>
            </View>

            {/* Localisation */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">Localisation *</Text>
              <TextInput
                className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-lg"
                placeholder="Ex: Épaule droite, Genou gauche..."
                value={form.localisation}
                onChangeText={(t) => setForm((f) => ({ ...f, localisation: t }))}
                autoFocus
              />
            </View>

            {/* Symptômes */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">Symptômes *</Text>
              <TextInput
                className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-lg"
                placeholder="Décrivez vos symptômes..."
                value={form.symptomes}
                onChangeText={(t) => setForm((f) => ({ ...f, symptomes: t }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Cause */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">Cause (optionnel)</Text>
              <TextInput
                className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-lg"
                placeholder="Ex: Chute, Sport, Travail..."
                value={form.cause}
                onChangeText={(t) => setForm((f) => ({ ...f, cause: t }))}
              />
            </View>

            {/* Intensité de la douleur */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">Niveau de douleur *</Text>
              <View className="rounded-xl bg-gray-50 p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Intensité</Text>
                  <Text className="text-lg font-bold text-blue-600">
                    {form.intensiteDouleur}/10
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <TouchableOpacity
                      key={level}
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        form.intensiteDouleur >= level
                          ? level <= 3
                            ? 'bg-green-500'
                            : level <= 6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                      onPress={() => setForm((f) => ({ ...f, intensiteDouleur: level }))}>
                      <Text
                        className={`text-xs font-bold ${
                          form.intensiteDouleur >= level ? 'text-white' : 'text-gray-500'
                        }`}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-xs text-gray-500">Faible</Text>
                  <Text className="text-xs text-gray-500">Modérée</Text>
                  <Text className="text-xs text-gray-500">Forte</Text>
                </View>
              </View>
            </View>

            {/* Date de début */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">Date de début *</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-lg"
                  placeholder="YYYY-MM-DD (ex: 2024-01-15)"
                  value={form.dateDebut}
                  onChangeText={(t) => setForm((f) => ({ ...f, dateDebut: t }))}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="ml-2 rounded-lg bg-blue-100 px-3 py-2"
                  onPress={suggestTodayDate}>
                  <Text className="text-sm font-medium text-blue-600">Aujourd'hui</Text>
                </TouchableOpacity>
              </View>
              <Text className="mt-2 text-sm text-gray-500">Format: AAAA-MM-JJ</Text>
            </View>

            {/* Validation */}
            {(!form.localisation || !form.symptomes || !form.dateDebut) && (
              <View className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <Text className="font-medium text-yellow-800">
                  ⚠️ Veuillez remplir tous les champs obligatoires
                </Text>
              </View>
            )}

            {/* Bouton d'enregistrement */}
            <TouchableOpacity
              className={`rounded-xl px-6 py-4 ${
                form.localisation && form.symptomes && form.dateDebut
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
              onPress={handleCreate}
              disabled={!form.localisation || !form.symptomes || !form.dateDebut}>
              <Text className="text-center text-lg font-bold text-white">
                Enregistrer la douleur
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      {/* Modal détail douleur */}
      <Modal visible={!!modalPain} animationType="slide" onRequestClose={() => setModalPain(null)}>
        <View className="flex-1 bg-white pt-12">
          <ScrollView className="flex-1 p-6">
            <Text className="mb-2 text-center text-xl font-bold text-blue-700">
              Détail de la douleur
            </Text>
            {modalPain && (
              <>
                <Text className="mb-1 font-bold text-blue-700">{modalPain.localisation}</Text>
                <Text className="mb-1">Symptômes : {modalPain.symptomes}</Text>
                {modalPain.cause ? <Text className="mb-1">Cause : {modalPain.cause}</Text> : null}
                <View className="mb-1 flex-row items-center">
                  <Text className="mr-2">
                    Début :{' '}
                    {modalPain.dateDebut && !isNaN(new Date(modalPain.dateDebut).getTime())
                      ? new Date(modalPain.dateDebut).toLocaleDateString()
                      : '-'}
                  </Text>
                  <View
                    className={`rounded-full px-2 py-1 ${
                      Number(modalPain.intensiteDouleur) <= 3
                        ? 'bg-green-100'
                        : Number(modalPain.intensiteDouleur) <= 6
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        Number(modalPain.intensiteDouleur) <= 3
                          ? 'text-green-700'
                          : Number(modalPain.intensiteDouleur) <= 6
                            ? 'text-yellow-700'
                            : 'text-red-700'
                      }`}>
                      Intensité : {modalPain.intensiteDouleur ? modalPain.intensiteDouleur : '-'}{' '}
                      /10
                    </Text>
                  </View>
                </View>
                <Text className="mt-2 font-semibold">Évolutions :</Text>
                {/* Historique des évolutions */}
                {modalPain.evolutions &&
                  Array.isArray(modalPain.evolutions) &&
                  modalPain.evolutions.length === 0 && (
                    <Text className="text-gray-400">Aucune évolution</Text>
                  )}
                {modalPain.evolutions &&
                  Array.isArray(modalPain.evolutions) &&
                  modalPain.evolutions.map((evo, i) => {
                    const intensiteNum = Number(evo.intensite);
                    return (
                      <View
                        key={i}
                        className="mb-2 flex-row items-center justify-between rounded-lg bg-blue-50 p-3">
                        <View className="flex-1">
                          <Text className="text-xs text-gray-400">
                            {new Date(evo.date).toLocaleString()}
                          </Text>
                          {evo.symptomes ? <Text className="text-sm">{evo.symptomes}</Text> : null}
                          {evo.note ? (
                            <Text className="text-xs italic text-gray-600">{evo.note}</Text>
                          ) : null}
                        </View>
                        {evo.intensite ? (
                          <View
                            className={`ml-2 rounded-full px-2 py-1 ${
                              intensiteNum <= 3
                                ? 'bg-green-100'
                                : intensiteNum <= 6
                                  ? 'bg-yellow-100'
                                  : 'bg-red-100'
                            }`}>
                            <Text
                              className={`text-xs font-bold ${
                                intensiteNum <= 3
                                  ? 'text-green-700'
                                  : intensiteNum <= 6
                                    ? 'text-yellow-700'
                                    : 'text-red-700'
                              }`}>
                              {intensiteNum}/10
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}

                {/* Séparateur */}
                <View className="my-4 border-t border-gray-200" />

                {/* Formulaire d'ajout d'évolution ou message si douleur finie */}
                {modalPain.status === 'fini' ? (
                  <View className="mt-4 rounded-xl bg-gray-100 p-4">
                    <Text className="text-center font-semibold text-gray-500">
                      Douleur clôturée – aucune évolution possible
                    </Text>
                  </View>
                ) : (
                  <View className="mb-4 rounded-xl bg-gray-50 p-4 shadow-sm">
                    <Text className="mb-4 text-lg font-bold text-blue-700">
                      Ajouter une évolution
                    </Text>
                    {/* Barre de progression */}
                    <View className="mb-4">
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-gray-600">Progression</Text>
                        <Text className="text-xs font-medium text-blue-600">
                          {
                            [evolution.intensite, evolution.note, evolution.symptomes].filter(
                              Boolean
                            ).length
                          }
                          /3
                        </Text>
                      </View>
                      <View className="flex-row space-x-1">
                        <View
                          className={`h-2 flex-1 rounded-full ${evolution.intensite ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                        <View
                          className={`h-2 flex-1 rounded-full ${evolution.note ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                        <View
                          className={`h-2 flex-1 rounded-full ${evolution.symptomes ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      </View>
                    </View>
                    {/* Sélecteur d'intensité */}
                    <Text className="mb-1 text-sm text-gray-700">Niveau de douleur (1-10)</Text>
                    <View className="mb-4 flex-row justify-between">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <TouchableOpacity
                          key={level}
                          className={`h-8 w-8 items-center justify-center rounded-full ${
                            Number(evolution.intensite) === level
                              ? level <= 3
                                ? 'bg-green-500'
                                : level <= 6
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              : 'bg-gray-200'
                          }`}
                          onPress={() => setEvolution((e) => ({ ...e, intensite: String(level) }))}>
                          <Text
                            className={`text-xs font-bold ${
                              Number(evolution.intensite) === level ? 'text-white' : 'text-gray-500'
                            }`}>
                            {level}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text className="mb-1 text-sm text-gray-700">Note</Text>
                    <TextInput
                      className="mb-2 rounded-lg border bg-white p-2"
                      placeholder="Note"
                      value={evolution.note}
                      onChangeText={(t) => setEvolution((e) => ({ ...e, note: t }))}
                    />
                    <Text className="mb-1 text-sm text-gray-700">Symptômes</Text>
                    <TextInput
                      className="mb-2 rounded-lg border bg-white p-2"
                      placeholder="Symptômes"
                      value={evolution.symptomes}
                      onChangeText={(t) => setEvolution((e) => ({ ...e, symptomes: t }))}
                    />
                    <TouchableOpacity
                      className={`mt-4 rounded bg-blue-600 px-6 py-3 ${
                        !evolution.note || !evolution.intensite || !evolution.symptomes
                          ? 'opacity-50'
                          : ''
                      }`}
                      onPress={handleAddEvolution}
                      disabled={!evolution.note || !evolution.intensite || !evolution.symptomes}>
                      <Text className="text-center font-bold text-white">Ajouter</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>
          {/* Boutons d'action en bas du modal */}
          <View className="flex-row justify-between border-t border-gray-100 bg-white p-4">
            <TouchableOpacity
              className="mr-2 flex-1 rounded bg-gray-200 px-6 py-2"
              onPress={() => setModalPain(null)}>
              <Text className="text-center">Fermer</Text>
            </TouchableOpacity>
            {modalPain && modalPain.status === 'actif' && (
              <TouchableOpacity
                className="ml-2 flex-1 rounded bg-red-600 px-6 py-2"
                onPress={() => handleClosePain(modalPain._id)}>
                <Text className="text-center font-bold text-white">Clôturer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
