import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getApiBase } from '../../services/apiBase';

export default function StoreScreen() {
  const [category, setCategory] = useState('food');
  const [cart, setCart] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/store/products`);
        const data = await response.json();
        setProductsData(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    Alert.alert('Added', `${product.name} added to cart.`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before checking out.');
      return;
    }
    try {
      const response = await fetch(`${getApiBase()}/api/store/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })) })
      });
      const data = await response.json();
      if (data.url) {
        const result = await WebBrowser.openBrowserAsync(data.url);
        if (result.type === 'cancel' || result.type === 'dismiss') {
          // Can check status, maybe clear cart if successful in real app
          // For now we clear cart on success
          setCart([]);
        }
      } else {
        Alert.alert('Error', 'Failed to initialize checkout.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Checkout Error', 'Something went wrong.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const displayedProducts = productsData.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Pet Store</Text>
                <Text style={styles.subtitle}>Premium supplies for companions.</Text>
            </View>
            <TouchableOpacity style={styles.cartBtn} onPress={handleCheckout}>
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
            {loading ? (
                <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 50 }} />
            ) : (
                displayedProducts.map(product => (
                    <View key={product.id} style={styles.card}>
                    <Image source={{ uri: product.image_url || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productDesc}>{product.description}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <FontAwesome name="star" size={14} color="#fbbf24" />
                            <Text style={styles.ratingText}> {product.rating || '4.5'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                            <TouchableOpacity style={styles.buyButton} onPress={() => addToCart(product)}>
                            <Text style={{ color: 'white', fontWeight: '700' }}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                ))
            )}
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
