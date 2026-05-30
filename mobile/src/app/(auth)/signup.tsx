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

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signup(email, password, { first_name: firstName, last_name: lastName });
      Alert.alert('Success', 'Check your email for confirmation, or log in if auto-confirmed.');
      router.replace('/(auth)/login');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const redirectUrl = Linking.createURL('/');
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
          const urlObj = Linking.parse(result.url);
          let accessToken = urlObj.queryParams?.access_token;
          let refreshToken = urlObj.queryParams?.refresh_token;
          
          if (!accessToken) {
            const hashMatch = result.url.match(/#(.+)/);
            if (hashMatch) {
              const paramsString = hashMatch[1];
              const paramsArray = paramsString.split('&');
              paramsArray.forEach(pair => {
                  const [key, value] = pair.split('=');
                  if (key === 'access_token') accessToken = value;
                  if (key === 'refresh_token') refreshToken = value;
              });
            }
          }

          if (accessToken && refreshToken) {
             const { error: sessionError } = await supabase.auth.setSession({ 
               access_token: accessToken, 
               refresh_token: refreshToken 
             });
             if (sessionError) {
               Alert.alert('Session Error', sessionError.message);
             } else {
               router.replace('/(tabs)');
             }
          }
        }
      }
    } catch (error) {
      Alert.alert('OAuth Error', error.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30, marginBottom: 15, alignItems: 'center' }}>
        <Text style={{ color: '#64748b' }}>Or continue with</Text>
      </View>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }]} onPress={() => handleOAuth('google')}>
        <FontAwesome name="google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
        <Text style={[styles.socialButtonText, { color: '#1e293b' }]}>Sign up with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]} onPress={() => handleOAuth('facebook')}>
        <FontAwesome name="facebook" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign up with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Back to Login</Text>
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
  linkText: { color: '#7c3aed', textAlign: 'center', marginTop: 20, fontWeight: '600' }
});
