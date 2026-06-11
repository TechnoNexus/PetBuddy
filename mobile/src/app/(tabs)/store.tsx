import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getApiBase } from '../../services/apiBase';
import { supabase } from '../../supabaseClient';
import Animated, { FadeInDown, Layout, ZoomIn } from 'react-native-reanimated';

export default function StoreScreen() {
  const [category, setCategory] = useState('food');
  const [cart, setCart] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/store/products`);
        const data = await response.json();
        setProductsData(Array.isArray(data) ? data : (data.products || []));
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

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before checking out.');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        Alert.alert('Authentication Required', 'Please log in to checkout.');
        return;
      }

      const response = await fetch(`${getApiBase()}/api/store/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
          success_url: Linking.createURL('order-success') + '?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: Linking.createURL('store')
        })
      });
      const data = await response.json();
      if (data.url) {
        const result = await WebBrowser.openBrowserAsync(data.url);
        if (result.type === 'cancel' || result.type === 'dismiss') {
          // Can check status, maybe clear cart if successful in real app
          // For now we clear cart on success
          setCart([]);
          setCartVisible(false);
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
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const displayedProducts = productsData.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Pet Store</Text>
                <Text style={styles.subtitle}>Premium supplies for companions.</Text>
            </View>
            <TouchableOpacity style={styles.cartBtn} onPress={() => setCartVisible(true)}>
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
                displayedProducts.map((product, index) => (
                    <Animated.View key={product.id} entering={FadeInDown.delay(index * 100).springify()} layout={Layout.springify()} style={styles.cardContainer}>
                      <View style={[styles.glassCard, { backgroundColor: 'rgba(255, 255, 255, 0.85)' }]}>
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
                    </Animated.View>
                ))
            )}
        </ScrollView>

        <Modal visible={isCartVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Your Cart</Text>
                <TouchableOpacity onPress={() => setCartVisible(false)}>
                  <FontAwesome name="times" size={24} color="#1e293b" />
                </TouchableOpacity>
              </View>

              {cart.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>Your cart is empty.</Text>
                </View>
              ) : (
                <ScrollView style={styles.cartList}>
                  {cart.map(item => (
                    <View key={item.id} style={styles.cartItem}>
                      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.cartItemImage} />
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                          <FontAwesome name="minus" size={12} color="#1e293b" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                          <FontAwesome name="plus" size={12} color="#1e293b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.checkoutBtn, cart.length === 0 && styles.disabledBtn]} 
                  onPress={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <Text style={styles.checkoutBtnText}>Proceed to Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  cardContainer: { marginTop: 15, borderRadius: 24, overflow: 'hidden', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  glassCard: { width: '100%' },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  productName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  productDesc: { fontSize: 14, color: '#64748b', marginTop: 5 },
  ratingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  productPrice: { fontSize: 22, fontWeight: '800', color: '#10b981' },
  buyButton: { backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  emptyCart: { padding: 40, alignItems: 'center' },
  emptyCartText: { fontSize: 16, color: '#64748b' },
  cartList: { marginBottom: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#f8fafc', padding: 10, borderRadius: 15 },
  cartItemImage: { width: 60, height: 60, borderRadius: 10 },
  cartItemDetails: { flex: 1, marginLeft: 15 },
  cartItemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  cartItemPrice: { fontSize: 14, fontWeight: '600', color: '#10b981', marginTop: 4 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 10, fontSize: 16, fontWeight: '700' },
  cartFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#64748b' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  checkoutBtn: { backgroundColor: '#7c3aed', padding: 18, borderRadius: 15, alignItems: 'center' },
  checkoutBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#cbd5e1' }
});
