import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import '../global.css'; // If NativeWind is used

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7c3aed',
    background: '#f8fafc',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={MyTheme}>
      <AuthProvider>
        <Stack screenOptions={{ 
            headerShown: false,
            animation: 'default',
            fullScreenGestureEnabled: true,
         }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/signup" />
            <Stack.Screen name="adopt" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="chat/[id]" options={{ presentation: 'card', animation: 'default' }} />
            <Stack.Screen name="scavenge-detail" options={{ presentation: 'card', animation: 'slide_from_right', headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
