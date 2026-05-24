import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [adoptionHistory, setAdoptionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userProfile, setUserProfile] = useState({
    firstName: user?.user_metadata?.first_name || user?.user_metadata?.firstName || 'Guest',
    lastName: user?.user_metadata?.last_name || user?.user_metadata?.lastName || 'User',
    email: user?.email || 'guest@example.com',
    phone: user?.user_metadata?.phone || '+1 234 567 8900',
    location: user?.user_metadata?.location || 'New York, NY',
    bio: user?.user_metadata?.bio || 'Animal lover and proud pet parent. Looking to expand my furry family!',
    petPreferences: user?.user_metadata?.petPreferences || 'No specific preferences',
  });

  const handleSaveProfile = async () => {
    setIsEditing(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: userProfile.phone,
          location: userProfile.location,
          bio: userProfile.bio,
          petPreferences: userProfile.petPreferences,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName
        }
      });
      if (error) throw error;
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile.");
      console.error(e);
    }
  };

  const myPets = user?.user_metadata?.myPets || [
    { id: 1, name: "Max", type: "Dog", adoptionDate: "06/15/2022", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&q=80" },
    { id: 2, name: "Luna", type: "Cat", adoptionDate: "01/20/2023", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&q=80" }
  ];

  useEffect(() => {
    if (!user?.email) return;
    setHistoryLoading(true);
    supabase
      .from('adoption_applications')
      .select('*')
      .eq('applicant_email', user.email)
      .order('submitted_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAdoptionHistory(data);
        setHistoryLoading(false);
      });
  }, [user]);

  const orders = user?.user_metadata?.orders || [
    { orderId: "ORD123456", date: "01/15/2024", total: 54.98, items: [{ id: 1, name: "Premium Dog Food", quantity: 1, price: 29.99 }] }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.heroBackground} />
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
           <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile.firstName.charAt(0)}</Text>
           </View>
           <Text style={styles.name}>{`${userProfile.firstName} ${userProfile.lastName}`}</Text>
           
           {isEditing ? (
             <View style={styles.editForm}>
                <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94a3b8" value={userProfile.email} onChangeText={t => setUserProfile({...userProfile, email: t})} />
                <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#94a3b8" value={userProfile.phone} onChangeText={t => setUserProfile({...userProfile, phone: t})} />
                <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#94a3b8" value={userProfile.location} onChangeText={t => setUserProfile({...userProfile, location: t})} />
                <TextInput style={[styles.input, { height: 80 }]} placeholder="Bio" placeholderTextColor="#94a3b8" value={userProfile.bio} onChangeText={t => setUserProfile({...userProfile, bio: t})} multiline />
                <TextInput style={styles.input} placeholder="Pet Preferences" placeholderTextColor="#94a3b8" value={userProfile.petPreferences} onChangeText={t => setUserProfile({...userProfile, petPreferences: t})} />
             </View>
           ) : (
             <>
               <Text style={styles.bio}>{userProfile.bio}</Text>
               <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#7c3aed" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{userProfile.email}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color="#7c3aed" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{userProfile.phone}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#7c3aed" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{userProfile.location}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Ionicons name="paw" size={20} color="#7c3aed" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{userProfile.petPreferences}</Text>
               </View>
             </>
           )}

           <TouchableOpacity style={[styles.editButton, isEditing && { backgroundColor: '#10b981' }]} onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
              <Text style={styles.editButtonText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
           </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.contentCard}>
           <View style={styles.tabsRow}>
              <TouchableOpacity style={[styles.tab, tabValue === 0 && styles.activeTab]} onPress={() => setTabValue(0)}>
                <Text style={[styles.tabText, tabValue === 0 && styles.activeTabText]}>My Pets</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tabValue === 1 && styles.activeTab]} onPress={() => setTabValue(1)}>
                <Text style={[styles.tabText, tabValue === 1 && styles.activeTabText]}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tabValue === 2 && styles.activeTab]} onPress={() => setTabValue(2)}>
                <Text style={[styles.tabText, tabValue === 2 && styles.activeTabText]}>Orders</Text>
              </TouchableOpacity>
           </View>

           <View style={styles.tabContent}>
              {tabValue === 0 && myPets.map(pet => (
                <View key={pet.id} style={styles.itemRow}>
                   <Image source={{ uri: pet.image }} style={styles.itemImage} />
                   <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{pet.name}</Text>
                      <Text style={styles.itemSub}>{pet.type}</Text>
                      <Text style={styles.itemMeta}>Adopted: {pet.adoptionDate}</Text>
                   </View>
                </View>
              ))}

              {tabValue === 1 && (
                historyLoading ? (
                  <Text style={{ textAlign: 'center', color: '#64748b', paddingVertical: 20 }}>Loading...</Text>
                ) : adoptionHistory.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#64748b', paddingVertical: 20 }}>No adoption applications found.</Text>
                ) : (
                  adoptionHistory.map((app, idx) => {
                    const statusLower = (app.status || '').toLowerCase();
                    const badgeBg =
                      statusLower === 'approved'  ? 'rgba(46,125,50,0.1)' :
                      statusLower === 'rejected'  ? 'rgba(211,47,47,0.1)' :
                      statusLower === 'contacted' ? 'rgba(2,136,209,0.1)' :
                                                    'rgba(237,108,2,0.1)';
                    const badgeColor =
                      statusLower === 'approved'  ? '#2e7d32' :
                      statusLower === 'rejected'  ? '#d32f2f' :
                      statusLower === 'contacted' ? '#0288d1' :
                                                    '#ed6c02';
                    const dateStr = app.submitted_at
                      ? new Date(app.submitted_at).toLocaleDateString()
                      : '';
                    return (
                      <View key={app.id ?? idx} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{app.pet_name}</Text>
                          <Text style={styles.itemSub}>Submitted: {dateStr}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.statusText, { color: badgeColor }]}>
                            {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )
              )}

              {tabValue === 2 && orders.map(order => (
                <View key={order.orderId} style={[styles.itemRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                     <Text style={styles.itemTitle}>Order #{order.orderId}</Text>
                     <Text style={{ fontWeight: '700', color: '#7c3aed' }}>${order.total}</Text>
                   </View>
                   <Text style={[styles.itemSub, { marginBottom: 10 }]}>{order.date}</Text>
                   {order.items.map(item => (
                     <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                        <Text style={{ color: '#475569' }}>{item.quantity}x {item.name}</Text>
                        <Text style={{ fontWeight: '600', color: '#1e293b' }}>${item.price}</Text>
                     </View>
                   ))}
                </View>
              ))}
           </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
           <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 250, backgroundColor: '#7c3aed', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  profileCard: { backgroundColor: 'white', marginTop: 80, borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#c4b5fd', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white', marginTop: -60, marginBottom: 15 },
  avatarText: { fontSize: 48, fontWeight: '800', color: '#7c3aed' },
  name: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  bio: { textAlign: 'center', color: '#64748b', marginBottom: 20, paddingHorizontal: 10, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 15, width: '100%' },
  infoIcon: { width: 30, textAlign: 'center' },
  infoText: { fontSize: 15, color: '#1e293b', fontWeight: '600', flex: 1 },
  editForm: { width: '100%', marginBottom: 15 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 15 },
  editButton: { width: '100%', backgroundColor: '#7c3aed', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  editButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  contentCard: { backgroundColor: 'white', marginTop: 20, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#7c3aed' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#7c3aed', fontWeight: '800' },
  tabContent: { padding: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 15, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  itemImage: { width: 60, height: 60, borderRadius: 12, marginRight: 15 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  itemSub: { fontSize: 14, color: '#64748b' },
  itemMeta: { fontSize: 12, color: '#7c3aed', fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  logoutButton: { marginTop: 20, padding: 15, alignItems: 'center', marginBottom: 40 },
  logoutText: { color: '#f43f5e', fontWeight: '700', fontSize: 16 }
});
