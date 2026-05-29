import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiBase } from '../../services/apiBase';

type ServiceResult = {
  id?: string;
  image?: string;
  name?: string;
  location?: string;
  description?: string;
  url?: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const searchServices = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    const apiBase = getApiBase();
    console.log('[PetBuddy] Services calling:', `${apiBase}/api/ai/scavenge`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(`${apiBase}/api/ai/scavenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',  // bypass localtunnel tourist check
        },
        body: JSON.stringify({ query: query, search_type: 'services' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Search failed with status ${response.status}`);
      }
      console.log('[PetBuddy] Services results count:', data.results?.length);
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(
        e?.name === 'AbortError'
          ? 'Search timed out. Please try a more specific search.'
          : (e?.message || 'Failed to search services. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Pet Services</Text>
          <Text style={styles.subtitle}>Use our AI to find highly rated local groomers, vets, and dog walkers near you.</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="sparkles" size={20} color="#7c3aed" style={styles.searchIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Find a mobile dog groomer in Manhattan" 
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchServices}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchServices} disabled={loading}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Scavenging the internet...</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {results.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.card}
                onPress={() => router.push({ pathname: '/scavenge-detail', params: { item: encodeURIComponent(JSON.stringify(item)) } })}
              >
                <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80" }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#f43f5e" />
                    <Text style={styles.itemLocation}>{item.location}</Text>
                  </View>
                  <Text style={styles.itemDesc} numberOfLines={3}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {!loading && results.length === 0 && query !== '' && (
               <Text style={styles.emptyText}>No services found. Try another search.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#64748b' },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 25 },
  searchIcon: { paddingHorizontal: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1e293b' },
  searchBtn: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 12, marginLeft: 5 },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#64748b', fontWeight: '600' },
  errorText: { color: '#f43f5e', textAlign: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 16 },
  resultsContainer: { paddingBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardImage: { width: '100%', height: 180 },
  cardContent: { padding: 20 },
  itemName: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemLocation: { fontSize: 14, color: '#64748b', marginLeft: 5, fontWeight: '600' },
  itemDesc: { fontSize: 15, color: '#475569', lineHeight: 22 }
});
