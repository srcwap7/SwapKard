import React, { useState } from 'react';
import { Text, View, Button, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ProfilePic({route}) {
  const { email, name, password, token } = route.params;
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
    } else {
      alert('No Picture Selected');
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) {
      alert('Please select an image first!');
      return;
    }

    try {
      const response = await fetch(imageUri);
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profilePicture',
      }, 'profilePicture.jpg');

      const res = await axios.post(
        'http://10.50.53.155:5000/api/v1/uploadProfilePic',
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          transformRequest: (data) => {
            return data;
          },
        }
      );

      if (res.data.success) {
        console.log('Uploaded successfully with URL:', res.data.fileUrl);
        navigation.navigate('Details', {
          cloudinary: res.data.fileUrl,
          email: email,
          name: name,
          password: password,
          token: token,
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error uploading image';
      alert('Error uploading image: ' + message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={imageUri ? { uri: imageUri } : require('../assets/default_profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.headerText}>Please Choose a Profile Picture</Text>
          <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.proceedButton]} onPress={uploadPhoto}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Details', {
            email: email,
            name: name,
            password: password,
            token: token,
          })}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 50,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: 200, 
    alignItems: 'center',
  },
  proceedButton: {
    backgroundColor: '#5CB85C', 
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: 200, 
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipText: {
    color: '#4A90E2', 
    fontSize: 16,
    fontWeight: '600',
  },
});