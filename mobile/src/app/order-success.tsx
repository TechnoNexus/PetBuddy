import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiBase } from '../services/apiBase';
import { supabase } from '../supabaseClient';

export default function OrderSuccessScreen() {
  const { session_id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!session_id) {
      setError('Invalid session.');
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Please log in to verify your order.');
        }

        const response = await fetch(`${getApiBase()}/api/store/verify-session?session_id=${session_id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to verify session.');
        }

        if (data.status === 'success') {
          setOrderId(data.order_id);
        } else {
          setError('Order is not paid or still pending.');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Something went wrong verifying the order.');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [session_id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Verifying your payment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="close-circle" size={80} color="#f43f5e" />
        <Text style={styles.errorTitle}>Verification Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/store')}>
          <Text style={styles.buttonText}>Return to Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.centerContainer}>
      <Ionicons name="checkmark-circle" size={100} color="#10b981" />
      <Text style={styles.successTitle}>Payment Successful!</Text>
      <Text style={styles.successText}>Thank you for your purchase.</Text>
      {orderId ? <Text style={styles.orderIdText}>Order ID: {orderId}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/store')}>
        <Text style={styles.buttonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600'
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10
  },
  successText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10
  },
  orderIdText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 40
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 10
  },
  errorText: {
    fontSize: 16,
    color: '#f43f5e',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700'
  }
});
