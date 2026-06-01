import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiBase } from '../../services/apiBase';

type ScavengedPet = {
  id?: string;
  image?: string;
  name?: string;
  location?: string;
  description?: string;
};

function paramToString(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

export default function PetsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [petsData, setPetsData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    species: paramToString(params.species),
    breed: '',
    age: '',
    location: paramToString(params.location)
  });

  const [filteredPets, setFilteredPets] = useState<any[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<ScavengedPet[]>([]);
  const [aiError, setAiError] = useState('');

  const searchAiPets = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError('');
    const apiBase = getApiBase();
    console.log('[PetBuddy] Calling:', `${apiBase}/api/ai/scavenge`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout
      const response = await fetch(`${apiBase}/api/ai/scavenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',  // bypass localtunnel tourist check
        },
        body: JSON.stringify({ query: aiQuery, search_type: 'pets' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Search failed with status ${response.status}`);
      }
      console.log('[PetBuddy] AI results count:', data.results?.length);
      setAiResults(Array.isArray(data.results) ? data.results : []);
    } catch (e: any) {
      console.error(e);
      setAiError(
        e?.name === 'AbortError'
          ? 'Search timed out. Please try a more specific search.'
          : (e?.message || 'Failed to search pets. Please try again.')
      );
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const species = paramToString(params.species);
    const location = paramToString(params.location);
    if (species) setFilters(f => ({ ...f, species }));
    if (location) setFilters(f => ({ ...f, location }));
  }, [params]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/pets`);
        const data = await response.json();
        setPetsData(data);
      } catch (e) {
        console.error('Failed to fetch pets:', e);
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    let result = petsData;
    if (filters.species) {
      result = result.filter(p => p.species.toLowerCase() === filters.species.toLowerCase());
    }
    if (filters.breed) {
      result = result.filter(p => p.breed.toLowerCase().includes(filters.breed.toLowerCase()));
    }
    if (filters.location) {
      result = result.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.age) {
      // API might return age as number, so we toString it or vice versa
      result = result.filter(p => p.age?.toString() === filters.age);
    }
    setFilteredPets(result);
  }, [filters, petsData]);

  const clearFilters = () => setFilters({ species: '', breed: '', age: '', location: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Our Lovable Pets</Text>
          <Text style={styles.subtitle}>Use the filters below to find the perfect companion.</Text>
        </View>

        {/* USP AI Banner */}
        <TouchableOpacity 
          style={styles.uspBanner} 
          onPress={() => router.push(`/chat/ai?name=AI%20Assistant&petsContext=${encodeURIComponent(JSON.stringify(petsData))}`)}
        >
          <View style={styles.uspContent}>
            <Ionicons name="hardware-chip" size={32} color="white" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.uspTitle}>100% Free Offline AI Chat</Text>
              <Text style={styles.uspDesc}>Talk to our private, on-device AI assistant about pet adoption!</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* AI Toggle Section */}
        <View style={styles.aiToggleContainer}>
          <Ionicons name="sparkles" size={20} color="#7c3aed" style={{ marginRight: 10 }} />
          <Text style={styles.aiToggleLabel}>Use AI Internet Search</Text>
          <Switch value={aiMode} onValueChange={setAiMode} trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }} thumbColor={aiMode ? '#7c3aed' : '#f8fafc'} />
        </View>

        {aiMode ? (
          <View style={styles.aiSearchBox}>
            <TextInput 
              style={styles.aiInput} 
              placeholder="e.g. Find Siberian Husky puppies near Hamilton" 
              placeholderTextColor="#94a3b8"
              value={aiQuery}
              onChangeText={setAiQuery}
              onSubmitEditing={searchAiPets}
            />
            <TouchableOpacity style={styles.aiSearchBtn} onPress={searchAiPets} disabled={aiLoading}>
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.filterSection}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TextInput style={styles.filterInput} placeholder="Species (Dog, Cat)" placeholderTextColor="#94a3b8" value={filters.species} onChangeText={t => setFilters({...filters, species: t})} />
                <TextInput style={styles.filterInput} placeholder="Breed" placeholderTextColor="#94a3b8" value={filters.breed} onChangeText={t => setFilters({...filters, breed: t})} />
                <TextInput style={styles.filterInput} placeholder="Age (yrs)" placeholderTextColor="#94a3b8" value={filters.age} onChangeText={t => setFilters({...filters, age: t})} keyboardType="numeric" />
                <TextInput style={styles.filterInput} placeholder="Location" placeholderTextColor="#94a3b8" value={filters.location} onChangeText={t => setFilters({...filters, location: t})} />
             </ScrollView>
             {hasFilters && (
               <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                 <Text style={styles.clearBtnText}>Clear All Filters</Text>
               </TouchableOpacity>
             )}
          </View>
        )}
        
        {aiMode ? (
          aiLoading ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={{ marginTop: 15, color: '#64748b' }}>Scavenging the internet for pets...</Text>
            </View>
          ) : (
            <>
              {aiError ? <Text style={styles.errorText}>{aiError}</Text> : null}
              {aiResults.map((pet, index) => (
                <TouchableOpacity
                  key={pet.id || index}
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/scavenge-detail', params: { item: encodeURIComponent(JSON.stringify(pet)) } })}
                >
                  <Image source={{ uri: pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80" }} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                        <View style={styles.adoptButton}>
                          <Text style={styles.adoptButtonText}>View Details</Text>
                        </View>
                    </View>
                    <Text style={styles.petLocation}>{pet.location}</Text>
                    <Text style={styles.petDesc} numberOfLines={2}>{pet.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )
        ) : filteredPets.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
             <Text style={{ color: '#64748b', fontSize: 16 }}>No pets found matching criteria.</Text>
          </View>
        ) : (
          filteredPets.map(pet => (
            <View key={pet.id} style={styles.card}>
              <Image source={{ uri: pet.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <TouchableOpacity style={styles.adoptButton} onPress={() => router.push(`/adopt?petId=${pet.id}`)}>
                      <Text style={styles.adoptButtonText}>Adopt</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.petBreed}>{pet.breed} • {pet.age} yrs</Text>
                <Text style={styles.petLocation}>{pet.location}</Text>
                <Text style={styles.petDesc}>{pet.description}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB to add a pet */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-pet')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 10 },
  uspBanner: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#7c3aed', borderRadius: 16, padding: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  uspContent: { flexDirection: 'row', alignItems: 'center' },
  uspTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  uspDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
  filterSection: { paddingHorizontal: 20, marginBottom: 20 },
  filterInput: { backgroundColor: 'white', padding: 12, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, minWidth: 120, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  clearBtn: { alignSelf: 'flex-start', marginTop: 15, backgroundColor: '#f43f5e', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  clearBtnText: { color: 'white', fontWeight: '700', fontSize: 12 },
  aiToggleContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15, backgroundColor: 'white', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  aiToggleLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1e293b' },
  aiSearchBox: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 20, borderRadius: 16, padding: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 20 },
  aiInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, color: '#1e293b' },
  aiSearchBtn: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 12, marginLeft: 5 },
  errorText: { color: '#f43f5e', textAlign: 'center', marginHorizontal: 20, marginBottom: 20, fontWeight: '600' },
  card: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardImage: { width: '100%', height: 250 },
  cardContent: { padding: 20 },
  petName: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  petBreed: { fontSize: 14, color: '#7c3aed', textTransform: 'uppercase', fontWeight: '700', marginTop: 5 },
  petLocation: { fontSize: 12, color: '#94a3b8', marginBottom: 10, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  petDesc: { fontSize: 15, color: '#475569', lineHeight: 22 },
  adoptButton: { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  adoptButtonText: { color: 'white', fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center', shadowColor: '#f43f5e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }
});
