import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const products = {
  food: [
    { id: 1, name: "Premium Dog Food", price: "$29.99", rating: 4.5, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80", desc: "High-quality nutrition for adult dogs" },
    { id: 2, name: "Cat Food - Salmon", price: "$24.99", rating: 4.8, image: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800&q=80", desc: "Wild-caught salmon recipe" }
  ],
  clothes: [
    { id: 3, name: "Winter Dog Jacket", price: "$34.99", rating: 4.3, image: "https://images.unsplash.com/photo-1576578985983-0b5d0e44f521?w=800&q=80", desc: "Warm and waterproof" },
    { id: 4, name: "Cat Sweater", price: "$19.99", rating: 4.0, image: "https://images.unsplash.com/photo-1636654129379-e7ae6f30c6c0?w=800&q=80", desc: "Soft and comfortable" }
  ],
  accessories: [
    { id: 5, name: "Leather Collar", price: "$15.99", rating: 4.6, image: "https://images.unsplash.com/photo-1599233068953-7f75bbd6c8c7?w=800&q=80", desc: "Genuine leather, durable" },
    { id: 6, name: "Interactive Toy", price: "$12.99", rating: 4.7, image: "https://images.unsplash.com/photo-1577347209434-357d19994646?w=800&q=80", desc: "Keeps pets entertained" }
  ]
};

export default function StoreScreen() {
  const [category, setCategory] = useState('food');
  const [cartCount, setCartCount] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Pet Store</Text>
                <Text style={styles.subtitle}>Premium supplies for companions.</Text>
            </View>
            <TouchableOpacity style={styles.cartBtn} onPress={() => Alert.alert('Cart', `You have ${cartCount} items in your cart.`)}>
                <FontAwesome name="shopping-cart" size={24} color="#7c3aed" />
                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, category === 'food' && styles.activeTab]} onPress={() => setCategory('food')}>
                <Text style={[styles.tabText, category === 'food' && styles.activeTabText]}>Food & Treats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, category === 'clothes' && styles.activeTab]} onPress={() => setCategory('clothes')}>
                <Text style={[styles.tabText, category === 'clothes' && styles.activeTabText]}>Apparel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, category === 'accessories' && styles.activeTab]} onPress={() => setCategory('accessories')}>
                <Text style={[styles.tabText, category === 'accessories' && styles.activeTabText]}>Accessories</Text>
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
            {products[category].map(product => (
                <View key={product.id} style={styles.card}>
                <Image source={{ uri: product.image }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDesc}>{product.desc}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <FontAwesome name="star" size={14} color="#fbbf24" />
                        <Text style={styles.ratingText}> {product.rating}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                        <Text style={styles.productPrice}>{product.price}</Text>
                        <TouchableOpacity style={styles.buyButton} onPress={() => setCartCount(c => c + 1)}>
                        <Text style={{ color: 'white', fontWeight: '700' }}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>
            ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, zIndex: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#64748b' },
  cartBtn: { backgroundColor: '#f1f5f9', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#f43f5e', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  tabs: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 10, marginBottom: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  activeTab: { backgroundColor: '#f1f5f9' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#7c3aed', fontWeight: '800' },
  grid: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginTop: 15, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 20 },
  productName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  productDesc: { fontSize: 14, color: '#64748b', marginTop: 5 },
  ratingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  productPrice: { fontSize: 22, fontWeight: '800', color: '#10b981' },
  buyButton: { backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 }
});
