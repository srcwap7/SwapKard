import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have expo/vector-icons installed

export default function MenuPage() {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuSlideAnim = new Animated.Value(-300); // Initial position of menu (hidden)

  const toggleMenu = () => {
    if (menuVisible) {
      // Hide menu
      Animated.timing(menuSlideAnim, {
        toValue: -300, // Off-screen
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      // Show menu
      setMenuVisible(true);
      Animated.timing(menuSlideAnim, {
        toValue: 0, // On-screen
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburgerButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
      </View>

      {/* Animated Sliding Menu */}
      {menuVisible && (
        <Animated.View style={[styles.menuContainer, { left: menuSlideAnim }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Your broadcast R")}>
            <Text style={styles.menuText}>Your broadcast R</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Your private QR")}>
            <Text style={styles.menuText}>Your private QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Connections")}>
            <Text style={styles.menuText}>Connections</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Your pending invites")}>
            <Text style={styles.menuText}>Your pending invites</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Page Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>Welcome to the app!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  header: {
    height: 60,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  hamburgerButton: {
    marginRight: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: -300,
    width: 250,
    height: '100%',
    backgroundColor: '#333',
    paddingVertical: 20,
    paddingHorizontal: 15,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomColor: '#555',
    borderBottomWidth: 1,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: '#fff',
    fontSize: 18,
  },
});
