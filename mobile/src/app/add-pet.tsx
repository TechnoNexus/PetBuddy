import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiBase } from '../services/apiBase';
import { supabase } from '../supabaseClient';

export default function AddPetScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    description: '',
    location: ''
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.species) {
      Alert.alert('Validation Error', 'Name and Species are required.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        Alert.alert('Authentication Required', 'Please log in to add a pet.');
        setLoading(false);
        return;
      }

      // Backend expects multipart/form-data for /api/pets
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('species', form.species);
      if (form.breed) formData.append('breed', form.breed);
      if (form.age) formData.append('age', form.age);
      if (form.description) formData.append('description', form.description);
      if (form.location) formData.append('location', form.location);

      const response = await fetch(`${getApiBase()}/api/pets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
          // Don't set Content-Type to multipart/form-data manually, fetch will do it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to add pet.');
      }

      Alert.alert('Success', `${form.name} has been added!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Add a Pet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Max"
          value={form.name}
          onChangeText={(val) => handleChange('name', val)}
        />

        <Text style={styles.label}>Species *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Dog, Cat"
          value={form.species}
          onChangeText={(val) => handleChange('species', val)}
        />

        <Text style={styles.label}>Breed</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Golden Retriever"
          value={form.breed}
          onChangeText={(val) => handleChange('breed', val)}
        />

        <Text style={styles.label}>Age (years)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2"
          keyboardType="numeric"
          value={form.age}
          onChangeText={(val) => handleChange('age', val)}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Hamilton, ON"
          value={form.location}
          onChangeText={(val) => handleChange('location', val)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Tell us about the pet..."
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(val) => handleChange('description', val)}
        />

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Pet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: 'white',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3, 
    zIndex: 10 
  },
  backButton: {
    padding: 5,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 16, 
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: { 
    backgroundColor: '#7c3aed', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 30,
    marginBottom: 40,
    shadowColor: '#7c3aed', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 5
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: '700' }
});
