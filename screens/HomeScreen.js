import React, { useState, useRef, useEffect} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Animated,Easing,TouchableWithoutFeedback,Button} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCodeComp from '../components/QRcodeUrl';
import io from 'socket.io-client';
import QRScanner from '../components/Scanner';
import { useSelector, useDispatch } from 'react-redux';
import { getContactList, getPendingList, insertPendingUser, insertContactUser,deleteContactUser } from '../utils/database';
import { EventEmitter } from 'expo';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { deleteContactFile } from '../utils/fileManipulation';

export default function HomeScreen() {
  const isBroadcast = useRef("broadcast");
  const isPrivate = useRef("private");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBroadcastQRCode, setSelectedBroadcastQRCode] = useState(false);
  const [selectedPrivateQRCode, setSelectedPrivateQRCode] = useState(false);
  const [selectedHome, setSelectedHome] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const menuSlideAnim = useRef(new Animated.Value(-300)).current;
  const userObject = useSelector((state) => state.user);
  const [socket,setSocket] = useState(null);
  const eventEmitter = new EventEmitter();
  const navigation = useNavigation();

  const dispatch = useDispatch();

  async function saveImageToFileSystem(imageUri, filePath) {
    try {
      const directoryPath = FileSystem.documentDirectory + filePath.substring(0, filePath.lastIndexOf('/'));
      const filePathFull = FileSystem.documentDirectory + filePath;
      const dirInfo = await FileSystem.getInfoAsync(directoryPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
      }
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
      });
      const base64 = reader.result.split(',')[1];
      await FileSystem.writeAsStringAsync(filePathFull, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Image saved to file system:', filePathFull);
      return filePathFull;
    } catch (error) {
      console.error('Error saving image to file system:', error);
    }
  }

  useEffect(() => {
    if (!isConnected){
      const token = userObject.user.token;
      console.log("Token is",token);
      const newSocket = io('http://10.50.27.202:5000',{
        auth: {
          token:token
        }
      });
      
      setIsConnected(true);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to the socket io server');
        newSocket.emit('fetchedUpdates',{senderId:userObject.user.id});
      });

      newSocket.on('requestReceived',async(data)=>{
        try{
          const requestUser = data.user;
          const { _id } = requestUser;
          await saveImageToFileSystem(requestUser.avatar,`userpendingList/profilePics/${_id}_profile_pic.jpg`);
          eventEmitter.emit('requestReceived',data.user);
          insertPendingUser(
            requestUser._id,
            requestUser.name,
            requestUser.email,
            requestUser.job,       
            requestUser.workAt,
            requestUser.phone,
            requestUser.avatar 
          );
          dispatch({type:'RECEIVED_REQUEST',payload:requestUser});
        }
        catch(error){
          console.log("Error in receiving request");
          console.log(error);
        }
      });

      newSocket.on('requestAccepted',async(data)=>{
        try{
          const requestUser = data.accepter;
          const { _id } = requestUser;
          saveImageToFileSystem(requestUser.avatar,`usercontactList/profilePics/${_id}_profile_pic.jpg`);
          await insertContactUser(
            requestUser._id,
            requestUser.name,
            requestUser.email,
            requestUser.job,
            requestUser.workAt,
            requestUser.phone,
            requestUser.avatar,
            requestUser.age
          );
          dispatch({type:'ACCEPTED_REQUEST',payload:requestUser});
        }
        catch(error){
          console.log("Error in accepting request");
          console.log(error);
        }
      });

      newSocket.on('deletedConnection',async(data)=>{
        try{
          const deleterId = data.deleterId;
          deleteContactFile(deleterId);
          deleteContactUser(deleterId);
          dispatch({type:'REMOVE_CONNECTION',payload:deleterId});
        }
        catch(error){
          console.log(error);
        }
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from the socket io server');
      });

    }
  },[]);
  
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
            { text: 'Connections', onPress: () =>  navigation.navigate('Connections',{socket:socket}) },
            { text: 'Pending Invites', onPress: () => navigation.navigate('PendingUsersPage',{socket:socket}) },
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
              (<QRScanner socket={socket}/>)
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

        <Button
        title="debugger"
        onPress={
          async()=>{
            console.log("Pending List as on redux is",userObject.user.pendingList);
            const x = await getPendingList();
            console.log("Pending List as on disk is ",x);
            console.log("Contact List as on redux is",userObject.user.contactList);
            const y = await getContactList();
            console.log("Contact List as on disk is ",y);
          }
        }>
          debugger
        </Button>
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