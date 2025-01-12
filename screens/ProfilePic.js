import React, { useState } from 'react';
import { Text, View, Button, Image, ImageBackground,StyleSheet,TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfilePic() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
    } else {
      alert('No Pic Selected');
    }
  };

  return (
    <ImageBackground
        source={require("../assets/backgroundimage.jpeg")}
        resizeMode="cover"
        style={styles.background}
    >
        
        <View style={{ flex: 1, gap: 30, justifyContent: 'center', alignItems: 'center' }}>
        <Image
            source={imageUri ? { uri: imageUri } : require('../assets/default_profile.png')}
            style={{ width: 180, height: 180, borderRadius: 90 }}
        />
        <Text style={{ color: 'white' }}>Please Choose a Profile Picture</Text>
        <Button onPress={pickImageAsync} title="Upload" />
        <TouchableOpacity onPress={()=>navigation.navigate("Details")}> 
            <Text style={{color:'pink'}}>Proceed</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate("Details")}> 
            <Text style={{color:'pink'}}>Skip</Text>
        </TouchableOpacity>
        </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
