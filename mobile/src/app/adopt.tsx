import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { submitAdoptionApplication } from '../services/apiBase';

export default function AdoptScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { petId, petName, petUrl, petSource } = useLocalSearchParams();
  const isExternalPet = !!petUrl;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    hasOtherPets: false,
    otherPetsDetails: '',
    housingType: '',
    agreeToTerms: false
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to submit an adoption application.');
      return;
    }
    if (!formData.agreeToTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions.');
      return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await submitAdoptionApplication({
        pet_id: petId || null,
        pet_name: petName || null,
        pet_source_url: petUrl || null,
        pet_source: petSource || 'internal',
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        experience: formData.experience,
        has_other_pets: formData.hasOtherPets,
        other_pets_details: formData.otherPetsDetails,
        housing_type: formData.housingType,
        agreed_to_terms: formData.agreeToTerms
      });

      Alert.alert(
        'Application Submitted! 🎉',
        isExternalPet
          ? `Your interest in ${petName || 'this pet'} has been saved! We'll now take you to their listing to complete the adoption.`
          : 'Your adoption application has been submitted! Our team will review it and get back to you.',
        [
          {
            text: isExternalPet ? 'Go to Listing' : 'OK',
            onPress: () => {
              if (isExternalPet && petUrl) {
                Linking.openURL(petUrl as string);
              }
              router.back();
            }
          }
        ]
      );
    } catch (e) {
      console.error('[Adopt] Submit error:', e);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adoption Application</Text>
        <Text style={styles.subtitle}>
          {petName ? `Adopting: ${petName}` : `Applying for pet #${petId}`}
        </Text>
        {petSource ? <Text style={styles.source}>Via: {petSource as string}</Text> : null}
      </View>

      {!user && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>You must be logged in to submit an adoption application. Please log in from the Profile tab first.</Text>
        </View>
      )}

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="#94a3b8" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
        <TextInput style={styles.input} placeholder="Email *" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} />
        <TextInput style={styles.input} placeholder="Phone *" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} />
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Address" placeholderTextColor="#94a3b8" multiline value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} />
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Previous Pet Experience" placeholderTextColor="#94a3b8" multiline value={formData.experience} onChangeText={(t) => setFormData({...formData, experience: t})} />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Do you have other pets?</Text>
          <Switch value={formData.hasOtherPets} onValueChange={(v) => setFormData({...formData, hasOtherPets: v})} trackColor={{ false: '#e2e8f0', true: '#7c3aed' }} />
        </View>

        {formData.hasOtherPets && (
           <TextInput style={[styles.input, { height: 80 }]} placeholder="Other Pets Details" placeholderTextColor="#94a3b8" multiline value={formData.otherPetsDetails} onChangeText={(t) => setFormData({...formData, otherPetsDetails: t})} />
        )}

        <TextInput style={styles.input} placeholder="Housing Type (House, Apartment, Condo)" placeholderTextColor="#94a3b8" value={formData.housingType} onChangeText={(t) => setFormData({...formData, housingType: t})} />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>I agree to the terms and conditions</Text>
          <Switch value={formData.agreeToTerms} onValueChange={(v) => setFormData({...formData, agreeToTerms: v})} trackColor={{ false: '#e2e8f0', true: '#7c3aed' }} />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, (!formData.agreeToTerms || submitting) && { opacity: 0.5 }]} 
          onPress={handleSubmit} 
          disabled={!formData.agreeToTerms || submitting}
        >
          {submitting 
            ? <ActivityIndicator color="white" />
            : <Text style={styles.submitBtnText}>Submit Application</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  source: { fontSize: 13, color: '#7c3aed', fontWeight: '600', marginTop: 4 },
  form: { padding: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, color: '#1e293b' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  switchLabel: { fontSize: 16, color: '#1e293b', flex: 1, paddingRight: 10 },
  submitBtn: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  warningContainer: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#fffbeb', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fef3c7' },
  warningText: { color: '#b45309', fontSize: 14, fontWeight: '600' }
});
