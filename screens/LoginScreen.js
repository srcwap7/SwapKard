import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {Directory,File,Paths} from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy'
import {
  initializeDatabase,
  getPendingList,
  insertPendingUser,
  getContactList,
  insertContactUser,
  deleteContactUser,
  replaceData
} from '../utils/database';
import { deleteContactFile } from '../utils/fileManipulation';

// Utility Functions
const downloadImage = async (imageUrl,dir, id) => {
  try {
    console.log(dir);
    const directory = new Directory(Paths.document,`user/${dir}profilePics`);
    if (!directory.exist) directory.create();
    console.log(directory);
    const destination = new File(directory,`${id}_profile_pic.jpg`);
    const output = await File.downloadFileAsync(imageUrl,destination);
    console.log(output.uri);
    return output.uri;
  } 
  catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

const downloadImageList = async (array, directory) => {
  if (!array?.length) return;
  await Promise.all(
    array.map(({ avatar, _id }) => downloadImage(avatar,directory, _id))
  );
};

const saveSecureData = async (data, password) => {
  try {
    await SecureStore.setItemAsync(
      'user_data',
      JSON.stringify({
        email: data.email,
        password,
        name: data.name,
        userId: data._id,
        profilePicUrl: data.avatar,
        isLoggedIn:true,
        hasSignedUp:true,
        phone:data.phone
      })
    );
  }
  catch (error) {
    console.error('Failed to save data securely:', error);
    alert('Failed to save user credentials');
  }
};

const saveQRCode = async(fileName,base64Content) => {
  try {
    const userDirectory = new Directory(Paths.document,"user");
    if (!userDirectory.exists) userDirectory.create();
    const filePath = new File(userDirectory,fileName);
    const cleanBase64 = base64Content.replace(/^data:image\/\w+;base64,/, '');
    filePath.write(cleanBase64);
    console.log("QR code saved to ..",filePath.uri);
    return filePath;
  } 
  catch (error) {
    console.error('Error saving QR code:', error);
    alert('Disk full or other error occurred while saving file.');
  }
};

const deleteConnections = async (array) => {
  if (!array?.length) return;
  await Promise.all(
    array.map(id => Promise.all([deleteContactFile(id), deleteContactUser(id)]))
  );
};

const updateDetails = async (array) => {
  if (!array?.length) return;
  await Promise.all(
    array.map(({ _id, fieldChanged, newData }) => replaceData(_id, fieldChanged, newData))
  );
};

const saveToDatabase = async (dataArray, insertFn, fields) => {
  if (!dataArray?.length) return;
  await Promise.all(
    dataArray.map(item => {
      const params = fields.map(field => item[field]);
      return insertFn(...params);
    })
  );
};

const saveToDatabasePending = (dataArray) => saveToDatabase(dataArray, insertPendingUser, ['_id', 'name', 'email', 'job', 'workAt', 'phone', 'age']);
const saveToDatabaseContact = (dataArray) => saveToDatabase(dataArray, insertContactUser, ['_id', 'name', 'email', 'job', 'workAt', 'phone', 'age']);

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const hasPreviousEntry = useRef(false);

  const handleLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  const syncUserData = async (userData, currentPendingList, currentContactList) => {
    await Promise.all([
      downloadImageList(userData.deltaPending,'pendingList'),
      downloadImageList(userData.deltaConnection,'contactList'),
      updateDetails(userData.eventQueue),
      saveToDatabasePending(userData.deltaPending),
      saveToDatabaseContact(userData.deltaConnection),
      deleteConnections(userData.deletedConnections)
    ]);
    userData.pendingList = currentPendingList||[];
    userData.contactList = currentContactList||[];
    dispatch({type:'SET_USER',payload:userData});
    handleLogin();
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const storedData = await SecureStore.getItemAsync('user_data');
        if (storedData) {
          const userData = JSON.parse(storedData);
          if (userData.isLoggedIn) {
            hasPreviousEntry.current = true;
            const res = await axios.post("http://10.50.52.157:2000/api/v1/loginMobileSignedUp", {
              email: userData.email,
              password: userData.password
            });
            if (res.data.success) {
              const [currentPendingList, currentContactList] = await Promise.all([getPendingList(),getContactList()]);
              await syncUserData({ ...res.data.user, ...userData,token:res.data.token}, currentPendingList, currentContactList);
            }
          }
        }
      } 
      catch (error) {console.error('Error checking logged in user:', error);}
    };
    checkLoggedInUser();
  },[]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ScrollView style={styles.background}>
        <View style={styles.rootView}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.headerText}>Welcome Back</Text>
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values) => {
              try {
                let endpoint = hasPreviousEntry.current ? "http://10.50.52.157:2000/api/v1/loginMobileSignedUp":"http://10.50.52.157:2000/api/v1/loginMobile";
                const res = await axios.post(endpoint, values);

                if (res.data.success) {
                  const user = res.data.user;
                  user.token = res.data.token;
                  
                  if (!hasPreviousEntry.current) {
                    await initializeDatabase();
                    await downloadImage(user.avatar,"",user._id);
                    await Promise.all([
                      downloadImageList(user.pendingList,"pendingList"),
                      downloadImageList(user.contactList,"contactList"),
                      downloadImageList(user.deltaPending,"pendingList"),
                      downloadImageList(user.deltaConnection,"contactList"),
                      saveToDatabasePending(user.pendingList),
                      saveToDatabaseContact(user.contactList),
                      saveToDatabasePending(user.deltaPending),
                      saveToDatabaseContact(user.deltaConnection),
                      saveQRCode(`${user._id}_broadcast.png`,res.data.qrBroadcast),
                      saveQRCode(`${user._id}_private.png`,res.data.qrPrivate)
                    ]);
                    await saveSecureData(user,values.password);
                    user.pendingList = [...user.pendingList, ...user.deltaPending].map(({ avatar, ...rest }) => rest);
                    user.contactList = [...user.contactList, ...user.deltaConnection].map(({ avatar, ...rest }) => rest);
                  } 
                  else{
                    const [currentPendingList,currentContactList] = await Promise.all([getPendingList(),getContactList()]);
                    await syncUserData(user,currentPendingList,currentContactList);
                  }
                  dispatch({ type: 'SET_USER', payload: user });
                  navigation.navigate("HomeScreen");
                } 
                else alert("Invalid Credentials");
              }
              catch (error) {
                const errorMessage = error.response?.data?.message || 'An error occurred';
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
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
                  {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
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
  background: { flex: 1, backgroundColor: '#121212' },
  rootView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  headerText: { fontSize: 28, fontWeight: '600', color: '#ffffff', marginBottom: 30, letterSpacing: 0.5 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  formContainer: { width: '100%', maxWidth: 340, marginVertical: 20 },
  inputGroup: { marginBottom: 20 },
  labelText: { color: '#ffffff', fontSize: 16, marginBottom: 8, fontWeight: '500' },
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
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 5, fontWeight: '500' },
  loginButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: { color: '#ffffff', textAlign: 'center', fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  footerLink: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  footerText: { color: '#ffffff', fontSize: 14, marginRight: 6 },
  linkText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },
});