import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { moveFile , deleteFile } from '../utils/fileManipulation';
import { deletePendingUser,insertContactUser } from '../utils/database';
import { useSelector,useDispatch } from 'react-redux';

const ProfileCard = ({id,name,job,workAt,phoneNo,cloudinary,email,socket,age}) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 32;
  const imageSize = 100;
  const User = useSelector((state)=>state.user);
  const imageUri = `${FileSystem.documentDirectory}user/pendingList/profilePics/${id}_profile_pic.jpg`;
  const dispatch = useDispatch();
  console.log(imageUri);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#1E1E1E',
      borderRadius: 16,
      padding: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: cardWidth,
      borderWidth: 2,
      borderColor: '#BB86FC',
      shadowColor: '#BB86FC',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    topSection: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    imageContainer: {
      marginRight: 16,
    },
    profileImage: {
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
      borderWidth: 3,
      borderColor: '#BB86FC',
    },
    infoSection: {
      flex: 1,
      justifyContent: 'center',
    },
    nameAge: {
      color: '#E0E0E0',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    detailsContainer: {
      marginBottom: 16,
    },
    detailText: {
      color: '#A0A0A0',
      fontSize: 14,
      marginVertical: 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      flex: 0.48,
      justifyContent: 'center',
      elevation: 2,
    },
    acceptButton: {
      backgroundColor: '#4CAF50',
    },
    rejectButton: {
      backgroundColor: '#F44336',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
    },
    jobContainer: {
      backgroundColor: '#2D2D2D',
      padding: 8,
      borderRadius: 6,
      marginTop: 4,
    },
    jobText: {
      color: '#BB86FC',
      fontSize: 14,
      fontWeight: '500',
    }
  });

  const handleAccept = async() => {
    try{
      moveFile(id);
      deletePendingUser(id).catch((err)=>{console.log(err);});
      insertContactUser(id,name,email,job,workAt,phoneNo,cloudinary,age).catch((err)=>{console.log(err);});
      dispatch({type:'ADD_CONNECTION',payload:{_id:id,name:name,email:email,job:job,workAt:workAt,age:age,phone:phoneNo}});
      dispatch({type:'REMOVE_PENDING_INVITE',payload:id});
      socket.emit('acceptRequest',{senderId:id,accepterId:User.user.id});
      console.log('Accepted user:', id);
    }
    catch(error){console.log(error);}
  };

  const handleReject = () => {
    deletePendingUser(id).catch((err)=>{console.log(err);});
    deleteFile(id);
    dispatch({type:'REMOVE_PENDING_INVITE',payload:id});
    socket.emit('rejectRequest',{senderId:id,accepterId:User.user.id});
    console.log('Rejected user:', id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImage}
          />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.nameAge}>{name} </Text>
          <View style={styles.jobContainer}>
            <Text style={styles.jobText}>{job}</Text>
            <Text style={[styles.jobText, { fontSize: 12 }]}>{workAt}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>📧 {email}</Text>
        <Text style={styles.detailText}>📱 {phoneNo}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]} 
          onPress={handleAccept}
        >
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
        >
          <MaterialIcons name="cancel" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileCard;