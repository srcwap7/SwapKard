import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Dimensions ,Text} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';

export default function YourComponent({flag}) {
  const [imageUri, setImageUri] = useState(null);
  const User = useSelector((state) => state.user);

  const privateQR = flag === 'private' ? true : false;

  useEffect(() => {
    console.log('User:',flag);
    const loadImage = async () => {
      const filePath = `${FileSystem.documentDirectory}user/${User.user.id}_${flag}.png`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      console.log(filePath);
      if (fileInfo.exists) setImageUri(`file://${filePath}`);
    };
    loadImage();
  }, []);

  return (
    <View style={styles.container}>
      {privateQR && <Text style={styles.qrCodeText}>Private QR Code</Text>}
      {!privateQR && <Text style={styles.qrCodeText}>Broadcast QR Code</Text>}
      {imageUri && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 15,
    backgroundColor: 'white',
    padding: 10,
  },
  image: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
    borderRadius: 10,
  },
  qrCodeText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '300',
  },
});