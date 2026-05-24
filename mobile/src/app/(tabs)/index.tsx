import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const featuredPets = [
  { id: "2", name: "Luna", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80", breed: "Siamese Cat", age: 1 },
  { id: "1", name: "Max", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80", breed: "Golden Retriever", age: 2 },
  { id: "4", name: "Bella", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80", breed: "Persian Cat", age: 3 }
];

export default function HomeScreen() {
  const router = useRouter();
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Find Your Perfect Furry Companion</Text>
        <Text style={styles.heroSubtitle}>Adopt, don't shop. Give a loving home to a pet in need.</Text>

        <View style={styles.searchCard}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Pet Type (Dog, Cat, etc)" 
              placeholderTextColor="#94a3b8"
              value={species} 
              onChangeText={setSpecies} 
            />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Location" 
              placeholderTextColor="#94a3b8"
              value={location} 
              onChangeText={setLocation} 
            />
            <TouchableOpacity 
              style={styles.searchBtn} 
              onPress={() => router.push({ pathname: '/(tabs)/pets', params: { species, location } })}
            >
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Featured Pets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 40 }}>
          {featuredPets.map(pet => (
            <TouchableOpacity key={pet.id} style={styles.card} onPress={() => router.push(`/adopt?petId=${pet.id}`)}>
              <Image source={{ uri: pet.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed} • {pet.age} yrs</Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <View style={styles.infoSection}>
         <View style={styles.infoBox}>
            <FontAwesome name="heart" size={40} color="#f43f5e" style={{ marginBottom: 10 }} />
            <Text style={styles.infoTitle}>Why Adopt?</Text>
            <Text style={styles.infoDesc}>Give a loving home to pets in need. Adoption saves lives and creates lasting bonds.</Text>
         </View>
         <View style={styles.infoBox}>
            <FontAwesome name="paw" size={40} color="#7c3aed" style={{ marginBottom: 10 }} />
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoDesc}>Browse pets, submit an application, meet your potential companion, and welcome them home.</Text>
         </View>
         <View style={styles.infoBox}>
            <FontAwesome name="headphones" size={40} color="#10b981" style={{ marginBottom: 10 }} />
            <Text style={styles.infoTitle}>Support</Text>
            <Text style={styles.infoDesc}>Get guidance on pet care, training tips, and post-adoption support from our community.</Text>
         </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  hero: { backgroundColor: '#7c3aed', padding: 30, paddingTop: 80, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, marginBottom: -40, zIndex: 1 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: 'white', marginBottom: 15, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10 },
  heroSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 30 },
  searchCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  searchInput: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, marginBottom: 10, fontSize: 16 },
  searchBtn: { backgroundColor: '#f43f5e', padding: 15, borderRadius: 12, alignItems: 'center' },
  searchBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  sectionTitle: { fontSize: 24, fontWeight: '800', marginHorizontal: 20, marginTop: 70, marginBottom: 20, color: '#1e293b' },
  card: { width: 250, marginRight: 20, backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 20 },
  petName: { fontSize: 22, fontWeight: '800', marginBottom: 5, color: '#1e293b' },
  petBreed: { fontSize: 14, color: '#64748b', textTransform: 'uppercase', fontWeight: '700' },
  infoSection: { padding: 20, backgroundColor: 'white', marginTop: 20, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 40 },
  infoBox: { alignItems: 'center', textAlign: 'center', marginBottom: 40 },
  infoTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  infoDesc: { textAlign: 'center', color: '#64748b', fontSize: 15, lineHeight: 22, paddingHorizontal: 20 }
});
