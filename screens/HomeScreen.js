import React, { useState, useRef} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCodeComp from '../components/QRcodeUrl';

export default function HomeScreen() {
  const isBroadcast = useRef("broadcast");
  const isPrivate = useRef("private");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBroadcastQRCode, setSelectedBroadcastQRCode] = useState(false);
  const [selectedPrivateQRCode, setSelectedPrivateQRCode] = useState(false);
  const [selectedHome, setSelectedHome] = useState(true);
  const menuSlideAnim = useRef(new Animated.Value(-300)).current;

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuSlideAnim, {
        toValue: -300,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBroadcastQRCodeClick = () => {
    setSelectedBroadcastQRCode(true);
    setSelectedPrivateQRCode(false);
    setSelectedHome(false);
    toggleMenu();
  };

  const handlePrivateQRCodeClick = () => {
    setSelectedPrivateQRCode(true);
    setSelectedBroadcastQRCode(false);
    setSelectedHome(false);
    toggleMenu();
  };

  const handleHomeClick = () => {
    setSelectedHome(true);
    setSelectedBroadcastQRCode(false);
    setSelectedPrivateQRCode(false);
    toggleMenu();
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (menuVisible) toggleMenu();
    }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.hamburgerButton}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}></Text>
        </View>
        <Animated.View style={[styles.menuContainer, { 
          left: menuSlideAnim,
          shadowColor: '#fff',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5
        }]}>
          {[
            { text: 'Home', onPress: handleHomeClick },
            { text: 'Broadcast QR', onPress: handleBroadcastQRCodeClick },
            { text: 'Private QR', onPress: handlePrivateQRCodeClick },
            { text: 'Connections', onPress: () => alert("Connections") },
            { text: 'Pending Invites', onPress: () => alert("Your pending invites") }
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                index === 0 && { borderTopWidth: 0 }
              ]} 
              onPress={item.onPress}
            >
              <Text style={styles.menuText}>{item.text}</Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="rgba(255,255,255,0.5)" 
              />
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.content}>
          { selectedHome && 
            (<Text style={styles.contentText}>Welcome to the app!</Text>)
          }
          {selectedBroadcastQRCode && (
            <View style={styles.qrCodeWrapper}>
              <QRCodeComp flag={isBroadcast.current}/>
            </View>
          )}
          {selectedPrivateQRCode && (
            <View style={styles.qrCodeWrapper}>
              <QRCodeComp flag={isPrivate.current}/>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    height: 70,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  hamburgerButton: {
    marginRight: 20,
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    width: 280,
    height: '100%',
    backgroundColor: '#1E1E1E',
    paddingTop: 80,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1,
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '300',
  },
  qrCodeWrapper: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});