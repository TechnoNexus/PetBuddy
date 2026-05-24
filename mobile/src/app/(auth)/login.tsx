import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../supabaseClient';

if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, dummyLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      // Creates exp://... in dev, or mobile://... in prod
      const redirectUrl = Linking.createURL('/(tabs)');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      
      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          // Extract the tokens from the deep link URL hash fragment
          const hashMatch = result.url.match(/#(.+)/);
          if (hashMatch) {
            // URLSearchParams is globally available in React Native 0.70+
            // Wait, URLSearchParams parsing a hash string might behave differently on older RN.
            // Let's do a safe manual parse:
            const paramsString = hashMatch[1];
            const paramsArray = paramsString.split('&');
            const paramsObj = {};
            paramsArray.forEach(pair => {
                const [key, value] = pair.split('=');
                paramsObj[key] = value;
            });
            
            const { access_token, refresh_token } = paramsObj;
            if (access_token && refresh_token) {
               await supabase.auth.setSession({ access_token, refresh_token });
               router.replace('/(tabs)');
            }
          }
        }
      }
    } catch (error) {
      Alert.alert('OAuth Error', error.message || 'Something went wrong during authentication');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Log In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#10b981', marginTop: 15 }]} onPress={dummyLogin}>
        <Text style={styles.buttonText}>Dummy / Guest Login</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30, marginBottom: 15, alignItems: 'center' }}>
        <Text style={{ color: '#64748b' }}>Or continue with</Text>
      </View>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }]} onPress={() => handleOAuth('google')}>
        <FontAwesome name="google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
        <Text style={[styles.socialButtonText, { color: '#1e293b' }]}>Sign in with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]} onPress={() => handleOAuth('facebook')}>
        <FontAwesome name="facebook" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign in with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 40, textAlign: 'center', color: '#1e293b' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  button: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  socialButton: { flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  socialButtonText: { fontSize: 16, fontWeight: '600' },
  linkText: { color: '#7c3aed', textAlign: 'center', marginTop: 30, fontWeight: '600' }
});
