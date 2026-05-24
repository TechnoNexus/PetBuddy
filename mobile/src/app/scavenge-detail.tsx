import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ScavengeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  let item: any = {};
  try {
    item = JSON.parse(decodeURIComponent(params.item as string));
  } catch (e) {}

  const isPet = !!item.breed;
  const openUrl = () => { if (item.url) Linking.openURL(item.url); };

  const handleAdopt = () => {
    router.push({
      pathname: '/adopt',
      params: {
        petName: item.name,
        petUrl: item.url,
        petSource: item.shelter || 'AI Search',
      }
    });
  };


  const InfoBadge = ({ icon, label }: { icon: string; label: string }) => (
    <View style={styles.badge}>
      <Ionicons name={icon as any} size={14} color="#7c3aed" />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        {isPet && (
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroName}>{item.name}</Text>
            <Text style={styles.heroBreed}>{item.breed}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Pet Badges */}
        {isPet && (
          <View style={styles.badgeRow}>
            {item.age && item.age !== 'Unknown' && <InfoBadge icon="calendar-outline" label={item.age} />}
            {item.gender && item.gender !== 'Unknown' && <InfoBadge icon="male-female-outline" label={item.gender} />}
            {item.species && <InfoBadge icon="paw-outline" label={item.species} />}
            {item.color && item.color !== 'Unknown' && <InfoBadge icon="color-palette-outline" label={item.color} />}
            {item.vaccinated === true && <InfoBadge icon="shield-checkmark-outline" label="Vaccinated" />}
            {item.neutered === true && <InfoBadge icon="medical-outline" label="Neutered" />}
            {item.fee && <InfoBadge icon="card-outline" label={item.fee} />}
          </View>
        )}

        {/* Title for services */}
        {!isPet && (
          <>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#f43f5e" />
              <Text style={styles.location}>{item.location || 'Unknown Location'}</Text>
            </View>
          </>
        )}

        {/* Location row for pets */}
        {isPet && (
          <View style={styles.locationRow}>
            <Ionicons name="business-outline" size={16} color="#7c3aed" />
            <Text style={styles.shelterName}>{item.shelter || 'Unknown Shelter'}</Text>
            <Text style={styles.locationDivider}>•</Text>
            <Ionicons name="location" size={14} color="#f43f5e" />
            <Text style={styles.location}>{item.location || 'Unknown'}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isPet ? `About ${item.name}` : 'About'}</Text>
          <Text style={styles.sectionText}>{item.description || 'No description available.'}</Text>
        </View>

        {item.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Info</Text>
            <Text style={styles.sectionText}>{item.details}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {isPet ? (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleAdopt}>
                <Ionicons name="heart" size={18} color="white" />
                <Text style={styles.primaryBtnText}>Express Interest in Adopting</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={openUrl}>
                <Ionicons name="globe-outline" size={18} color="#7c3aed" />
                <Text style={styles.outlineBtnText}>View Full Listing</Text>
              </TouchableOpacity>
              {item.contact && (
                <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.contact}`)}>
                  <Ionicons name="call-outline" size={18} color="#16a34a" />
                  <Text style={styles.callBtnText}>{item.contact}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={openUrl}>
                <Ionicons name="globe-outline" size={18} color="white" />
                <Text style={styles.primaryBtnText}>Visit Website</Text>
              </TouchableOpacity>
              {item.phone && (
                <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <Ionicons name="call-outline" size={18} color="#16a34a" />
                  <Text style={styles.callBtnText}>{item.phone}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 320 },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(0,0,0,0.35)' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 55 : 20, left: 20, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 50, padding: 10 },
  heroTextContainer: { position: 'absolute', bottom: 20, left: 24, right: 24 },
  heroName: { fontSize: 32, fontWeight: '900', color: 'white' },
  heroBreed: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 2 },
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 60 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, color: '#7c3aed', fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20, flexWrap: 'wrap' },
  shelterName: { fontSize: 15, color: '#7c3aed', fontWeight: '700' },
  locationDivider: { color: '#94a3b8', marginHorizontal: 4 },
  location: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  sectionText: { fontSize: 16, color: '#475569', lineHeight: 26 },
  actions: { gap: 12, marginBottom: 28 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7c3aed', paddingVertical: 16, borderRadius: 16 },
  primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'white', paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: '#7c3aed' },
  outlineBtnText: { color: '#7c3aed', fontWeight: '800', fontSize: 16 },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f0fdf4', paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: '#16a34a' },
  callBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 15 },
});

