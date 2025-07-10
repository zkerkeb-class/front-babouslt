import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwt');
      console.log('token', token);
      if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return null; // Affiche rien, c'est juste une page de redirection
}
