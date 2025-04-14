import React, { useEffect , useRef} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {initializeDatabase,getPendingList,insertPendingUser,getContactList,insertContactUser,deleteContactUser} from '../utils/database';
import { deleteContactFile } from '../utils/fileManipulation';

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const hasPreviousEntry = useRef(false);

  const clearAppData = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
      const dbName = 'UserDB.db';
      const db = await SQLite.openDatabaseAsync(dbName);
      await db.execAsync('DROP TABLE IF EXISTS pendingList');
      await db.execAsync('DROP TABLE IF EXISTS contactList');
      console.log('SQLite database cleared');
      const directory = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(directory);
      await Promise.all(
        files.map(file =>
          FileSystem.deleteAsync(`${directory}${file}`, { idempotent: true })
        )
      );
      console.log('File system cleared');
      const profilePicsDir = `${FileSystem.documentDirectory}user/profilePics/pendingList/`;
      await FileSystem.deleteAsync(profilePicsDir, { idempotent: true });
      console.log('Profile pics directory cleared');
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
  };

  const downloadImage = async (imageUrl,directory,id) => {
    try {
      const directoryUri = `${FileSystem.documentDirectory}user${directory}/profilePics/`;
      const fileUri = `${directoryUri}${id}_profile_pic.jpg`;
      const dirInfo = await FileSystem.getInfoAsync(directoryUri);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUrl,
        fileUri
      );
      const { uri } = await downloadResumable.downloadAsync();
      console.log('File saved to:', uri);
      return uri; 
    } catch (error) {
      console.error('Errora downloading the images:', error);
      throw error;
    }
  };

  const saveQRCode = async (fileName, base64Content) => {
    try {
      const userDirectory = `${FileSystem.documentDirectory}user/`;
      const filePath = `${userDirectory}${fileName}`;
      const dirInfo = await FileSystem.getInfoAsync(userDirectory);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(userDirectory, { intermediates: true });
      const cleanBase64Content = base64Content.replace(/^data:image\/\w+;base64,/, '');
      await FileSystem.writeAsStringAsync(filePath,cleanBase64Content,{encoding: FileSystem.EncodingType.Base64,});
      console.log('File saved to:', filePath);
      return filePath;

    } catch (error) {
        console.error('Error saving file:', error);
        alert('Disk full or other error occurred while saving file.');
    }
  };

  const deleteConnections = async(array)=>{
    if (array){
      for (let i=0;i<array.length;i+=1){
        var id = array[i];
        deleteContactFile(id);
        deleteContactUser(id);
      }
    }
  };


  const downloadImageList = async(array,name) => {
    if (array){
      try {
        for (let i =0 ;i< array.length;i++){
          const { avatar , _id } = array[i];
          downloadImage(avatar,name,_id);
        }
      } catch (error) {
        console.error('Errorb downloading the imagex:', error);
        throw error;
      }
    }
  };

  const saveToDatabasePending = async(dataArray)=>{
    if (dataArray){
      try {
        for (let i=0;i<dataArray.length;i++){
          const { _id,name,email,job,workAt,phone,avatar,age} = dataArray[i];
          await insertPendingUser(_id,name,email,job,workAt,phone,avatar,age).then(
            ()=>console.log('success')
          ).catch(
            (error)=>{
              console.log(error);
            }
          )
        }

      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }
  };

  const saveToDatabaseContact = async(dataArray)=>{
    if (dataArray){
      try {
        for (let i=0;i<dataArray.length;i++){
          const { _id,name,email,phone,job,workAt,avatar,age} = dataArray[i];
          await insertContactUser(_id,name,email,job,workAt,phone,avatar,age).then(
            ()=>console.log('success')
          ).catch(
            (error)=>{
              console.log(error);
            }
          )
        }

      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const data = await SecureStore.getItemAsync('user_data');
        if (data) {
          console.log("Data found")
          const userData = JSON.parse(data);
          const { email, password } = userData;

          if (userData.isLoggedIn) {
            console.log(userData);
            const res = await axios.post("http://10.50.27.202:5000/api/v1/loginMobileSignedUp ", {
              email: email,
              password: password
            });

            if (res.data.success) {
              console.log(res.data.user);
              downloadImageList(res.data.user.deltaPending,'pendingList');
              downloadImageList(res.data.user.deltaConnection,'contactList');

              saveToDatabasePending(res.data.user.deltaPending);
              saveToDatabaseContact(res.data.user.deltaConnection);

              await deleteConnections(res.data.user.deletedConnections);

              const currentPendingList = await getPendingList();
              const currentContactList = await getContactList();

              res.data.user.pendingList = currentPendingList || [];
              res.data.user.contactList = currentContactList || [];
              
              res.data.user.token=res.data.token;
              console.log(res.data.user);
              dispatch({ type: 'SET_USER', payload: res.data.user });
              navigation.navigate('HomeScreen');

            }
          } else {
            console.log("User not logged in");
          }
        } else {
          hasPreviousEntry.current = false;
          console.log("No data found");
        }
      } catch (error) {
        console.log("Error:", error);

      }
    };
    checkLoggedInUser();
  },[]);

  return (
  <View style={{ flex: 1 , justifyContent: 'center'}}>
    <ScrollView style={styles.background}>
      <View style={styles.rootView}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Welcome Back</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={async (values) => {
            try {
              if (!hasPreviousEntry.current){
                console.log("No previous entry found")
                const res = await axios.post("http://10.50.27.202:5000/api/v1/loginMobile", {
                  email:values.email,
                  password:values.password
                });
                if (res.data.success) {
                  await SecureStore.setItemAsync(
                    'user_data',
                    JSON.stringify({
                      email: values.email,
                      password: values.password,
                      profilePicUrl: res.data.user.avatar,
                      userId: res.data.user._id,
                      keepLoggedIn: true,
                      isLoggedIn: true
                    })
                  );

                  res.data.user.token = res.data.token;
                  dispatch({type:'SET_USER',payload:res.data.user});

                  await initializeDatabase();

                  downloadImage(res.data.user.avatar,"User",res.data.user._id);
                  downloadImageList(res.data.user.pendingList,"pendingList").catch((error)=>{console.log(error)});
                  downloadImageList(res.data.user.contactList,"contactList").catch((error)=>{console.log(error)});
                  downloadImageList(res.data.user.deltaPending,"pendingList").catch((error)=>{console.log(error)});
                  downloadImageList(res.data.user.deltaConnection,"contactList").catch((error)=>{console.log(error)});

                  saveToDatabasePending(res.data.user.deltaPending).catch((error)=>{console.log(error)});
                  saveToDatabaseContact(res.data.user.deltaConnection).catch((error)=>{console.log(error)});
                  saveToDatabaseContact(res.data.user.contactList).catch((error)=>{console.log(error)});
                  saveToDatabasePending(res.data.user.pendingList).catch((error)=>{console.log(error)});

                  const pendingList = [...res.data.user.pendingList,...res.data.user.deltaPending].map(({ avatar, ...rest }) => rest);
                  const contactList = [...res.data.user.contactList, ...res.data.user.deltaConnection].map(({ avatar, ...rest }) => rest);  

                  res.data.user.pendingList = pendingList;
                  res.data.user.contactList = contactList;

                  const userBroadcastQR = res.data.qrBroadcast;
                  const userPrivateQR = res.data.qrPrivate;

                  console.log(res.data.user.deltaPending);

                  saveQRCode(res.data.user._id + '_broadcast.png', userBroadcastQR);
                  saveQRCode(res.data.user._id + '_private.png', userPrivateQR);

                  dispatch({type:'SET_USER',payload:res.data.user});
                  navigation.navigate("HomeScreen");
                } 
                else {
                  console.log("Request failed");
                  alert("Invalid Credentials");
                }
              }
              else{
                console.log("User setup already");
                const res = await axios.post("http://10.50.27.202:5000/api/v1/loginMobileSignedUp", {
                  email: values.email,
                  password: values.password
                });
                if (res.data.success) {
                  downloadImageList(res.data.user.deltaPending,'pendingList');
                  downloadImageList(res.data.user.deltaConnection,'contactList');

                  saveToDatabasePending(res.data.user.deltaPending);
                  saveToDatabaseContact(res.data.user.deltaConnection);

                  await deleteConnections(res.data.user.deletedConnections);

                  const currentPendingList = await getPendingList();
                  const currentContactList = await getContactList();

                  res.data.user.pendingList = currentPendingList || [];
                  res.data.user.contactList = currentContactList || [];

                  res.data.user.token=res.data.token;
                  console.log(res.data.user);
                  dispatch({ type: 'SET_USER', payload: res.data.user });
                  navigation.navigate('HomeScreen');
                }
                else{
                  console.log("Request failed");
                  console.log(error);
                }
              }
            } catch (error) {
              console.log("Here we go!");
              console.log(error);
              const errorMessage = error.response?error.response.data.message:'An error occurred';
              alert(errorMessage);
            }
          }}
          validate={(values) => {
            const errors = {};
            if (!values.email) errors.email = 'Required';
            else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) errors.email = 'Invalid email address';
            if (!values.password) errors.password = 'Required';
            else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
            return errors;
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.labelText}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.labelText}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSubmit}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.footerLink}>
          <Text style={styles.footerText}>New Here?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.linkText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerLink}>
          <Text style={styles.footerText}>Forgot Password?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.linkText}>Click Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#121212',
  },
  rootView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 6,
  },
  linkText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
});