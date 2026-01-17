import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { deleteContactFile } from '../utils/fileManipulation';
import { deleteContactUser } from '../utils/database';
import { useSelector, useDispatch } from 'react-redux';
import { Linking } from 'react-native';


const ContactCard = ({ id, name, job, workAt, phoneNo, email, socket }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 32;
  const imageSize = 80;
  const User = useSelector((state) => state.user);
  const imageUri = `${FileSystem.documentDirectory}user/contactListprofilePics/${id}_profile_pic.jpg`;
  const dispatch = useDispatch();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#121212',
      borderRadius: 16,
      padding: 16,
      width: cardWidth,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#BB86FC',
      shadowColor: '#BB86FC',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
    topSection: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    profileImage: {
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
      borderWidth: 2,
      borderColor: '#BB86FC',
      backgroundColor: '#333',
    },
    infoSection: {
      flex: 1,
      paddingLeft: 16,
      justifyContent: 'center',
    },
    nameText: {
      color: '#E0E0E0',
      fontSize: 20,
      fontWeight: 'bold',
    },
    jobContainer: {
      marginTop: 4,
      backgroundColor: '#292929',
      padding: 6,
      borderRadius: 6,
    },
    jobText: {
      color: '#BB86FC',
      fontSize: 13,
      fontWeight: '500',
    },
    detailText: {
      color: '#CCCCCC',
      fontSize: 14,
      marginBottom: 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      marginHorizontal: 5,
    },
    callButton: {
      backgroundColor: '#2E7D32',
    },
    emailButton: {
      backgroundColor: '#1565C0',
    },
    removeButton: {
      backgroundColor: '#C62828',
    },
    buttonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 6,
    },
  });

  const handleRemoval = () => {
    deleteContactUser(id);
    deleteContactFile(id);
    dispatch({type:'REMOVE_CONNECTION',payload:id});
    console.log(User);
    socket.emit('removeConnection',{deletedId:id,deleterId:User.user.id});
  };

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <Image
          source={{ uri: imageUri }}
          style={styles.profileImage}
        />
        <View style={styles.infoSection}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.jobContainer}>
            <Text style={styles.jobText}>{job}</Text>
            <Text style={[styles.jobText, { fontSize: 12 }]}>{workAt}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.detailText}>📧 {email}</Text>
      <Text style={styles.detailText}>📱 {phoneNo}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
            style={[styles.button, styles.callButton]}
            onPress={() => Linking.openURL(`tel:${phoneNo}`)}
        >
          <Feather name="phone-call" size={16} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.button, styles.emailButton]}
            onPress={() => Linking.openURL(`mailto:${email}`)}
        >
          <Feather name="mail" size={16} color="#fff" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={handleRemoval}>
          <MaterialIcons name="cancel" size={16} color="#fff" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactCard;
