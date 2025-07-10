import { Slot } from 'expo-router';
import './global.css';
import { StripeProvider } from '@stripe/stripe-react-native';

console.log('App.tsx chargé !');

export default function App() {
  return (
    <StripeProvider publishableKey="test_public_key_here">
      <Slot />
    </StripeProvider>
  );
}
