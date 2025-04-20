import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Camera } from 'lucide-react-native';

export default function ProfilePic({route}) {
  const { email, name, password, token } = route.params;
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImagePicking, setIsImagePicking] = useState(false);

  const spinValue = new Animated.Value(0);


  const startSpinAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(spinValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const UploadingOverlay = ({ progress, spin }) => (
    <View style={styles.uploadingOverlay}>
      <View style={styles.uploadContent}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Camera size={40} color="#fff" />
        </Animated.View>
        <Text style={styles.progressText}>{progress}%</Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.uploadingText}>Uploading your photo...</Text>
      </View>
    </View>
  );

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pickImageAsync = async () => {
    setIsImagePicking(true);
    try {
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
    } catch (error) {
      alert('Error picking image');
    } finally {
      setIsImagePicking(false);
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) {
      alert('Please select an image first!');
      return;
    }
  
    setIsUploading(true);
    startSpinAnimation();
    setUploadProgress(0);
  
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profilePicture',
      }, 'profilePicture.jpg');
  
      const res = await axios.post(
        'http://10.50.27.202:5000/api/v1/uploadProfilePic',
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
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
  
      if (res.data.success) {
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
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
    } finally {
      setIsUploading(false);
      spinValue.setValue(0);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={imageUri ? { uri: imageUri } : require('../assets/default_profile.png')}
              style={styles.profileImage}
            />
              {isUploading && (
                <UploadingOverlay progress={uploadProgress} spin={spin} />
              )}
          </View>

          <Text style={styles.headerText}>Please Choose a Profile Picture</Text>
          
          <TouchableOpacity 
            style={[styles.button, isImagePicking && styles.buttonDisabled]} 
            onPress={pickImageAsync}
            disabled={isImagePicking || isUploading}
          >
            <Text style={styles.buttonText}>
              {isImagePicking ? 'Selecting...' : 'Upload'}
            </Text>
            {isImagePicking && (
              <ActivityIndicator color="#fff" style={styles.buttonLoader} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.button, 
              styles.proceedButton,
              (isUploading || !imageUri) && styles.buttonDisabled
            ]} 
            onPress={uploadPhoto}
            disabled={isUploading || !imageUri}
          >
            <Text style={styles.buttonText}>
              {isUploading ? `Uploading ${uploadProgress}%` : 'Proceed'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => navigation.navigate('Details', {
              email: email,
              name: name,
              password: password,
              token: token,
            })}
            disabled={isUploading}
          >
          
          <Text style={[styles.skipText, isUploading && styles.textDisabled]}>
            Skip
          </Text>
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
  imageContainer: {
    position: 'relative',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
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
    marginRight: 8,
  },
  skipText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.5,
  },
  buttonLoader: {
    marginLeft: 8,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
    width: '100%',
    padding: 15,
  },
  progressText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  }
});