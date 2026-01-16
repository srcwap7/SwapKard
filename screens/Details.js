import React, { useState, useRef } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { initializeDatabase } from '../utils/database';
import { CelebrationModal } from '../components/congratulations';
import { CountryPicker } from "react-native-country-codes-picker";
import Checkbox from 'expo-checkbox';
import { useDispatch } from 'react-redux';

export default function Details({ route }) {
  const nameRef = useRef(route.params.name);
  const emailRef = useRef(route.params.email);
  const passwordRef = useRef(route.params.password);  
  const tokenRef = useRef(route.params.token);
  const cloudinaryRef = useRef(route.params.cloudinary);
  const [show, setShow] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [phone,setPhone] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const userId = useRef('');

  const saveImage = async (fileName,base64Content) => {
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


  const saveSecureData = async () => {
    try {
      await SecureStore.setItemAsync(
        'user_data',
        JSON.stringify({
          email: emailRef.current,
          password: passwordRef.current,
          name: nameRef.current,
          userId: userId.current,
          profilePicUrl: cloudinaryRef.current,
          isLoggedIn: keepLoggedIn,
          token: tokenRef.current,
          hasSignedUp:true,
          phone:phone
        })
      );
    } catch (error) {
      alert('Failed to save user credentials');
      console.error('Failed to save data securely:', error);
    }
  };

  const InputField = ({ label, ...props }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#666"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Complete Your Profile</Text>
        <Text style={styles.subHeaderText}>Let's get to know you better</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Formik
          initialValues={{ Role: '', WorksAt: '', phoneNo: '', website: '', age: '', countryCode: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.phoneNo) errors.phoneNo = 'Phone number is required';
            if (!values.Role) errors.Role = 'Role is required';
            if (!values.WorksAt) errors.WorksAt = 'Workplace is required';
            if (values.phoneNo && !/^\d{7,12}$/.test(values.phoneNo)) errors.phoneNo = 'Please enter a valid phone number';
            return errors;
          }}
          onSubmit={async (values) => {
            try {
              console.log(tokenRef.current);
              setPhone(`${values.countryCode}${values.phoneNo}`);
              initializeDatabase();
              const res = await axios.post(
                `http://10.10.209.128:2000/api/v1/details`,
                {
                  name: nameRef.current,
                  email: emailRef.current,
                  password: passwordRef.current,
                  avatar: cloudinaryRef.current,
                  job: values.Role,
                  workAt: values.WorksAt,
                  age: values.age,
                  phone: `${values.countryCode}${values.phoneNo}`,
                },
                {
                  headers: {
                    Authorization: `Bearer ${tokenRef.current}`,
                  },
                }
              );
              if (res.data.success) {
                userId.current = res.data.userId;
                saveSecureData();
                const userBroadcastQR = res.data.qrBroadcast;
                const userPrivateQR = res.data.qrPrivate;
                saveImage(userId.current + '_broadcast.png', userBroadcastQR);
                saveImage(userId.current + '_private.png', userPrivateQR);
                dispatch({type:'SET_USER',payload:res.data.user});
                setShowCelebration(true);
              } else {
                console.log(res.message);
                alert('Profile not created ' + res.message);
              }
            } catch (error) {
              console.error('Error:', error);
              const errorMessage = error.response
                ? error.response.data.message
                : 'An error occurred';
              alert(errorMessage);
            }
          }}
        >
          {({ values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue }) => (
            <View style={styles.formContainer}>
              <InputField
                label="Professional Role"
                value={values.Role}
                onBlur={handleBlur('Role')}
                onChangeText={handleChange('Role')}
                placeholder="e.g., Software Engineer"
              />
              {touched.Role && errors.Role && <Text style={styles.errorText}>{errors.Role}</Text>}

              <InputField
                label="Workplace"
                value={values.WorksAt}
                onBlur={handleBlur('WorksAt')}
                onChangeText={handleChange('WorksAt')}
                placeholder="e.g., Google"
              />
              {touched.WorksAt && errors.WorksAt && <Text style={styles.errorText}>{errors.WorksAt}</Text>}

              <View style={styles.phoneContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputWrapper}>
                  <TouchableOpacity 
                    onPress={() => setShow(true)} 
                    style={styles.countryCodeButton}
                  >
                    <Text style={styles.countryCodeText}>
                      {values.countryCode || '+1'}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    value={values.phoneNo}
                    onBlur={handleBlur('phoneNo')}
                    onChangeText={handleChange('phoneNo')}
                    placeholder="234 567 8900"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              {touched.phoneNo && errors.phoneNo && <Text style={styles.errorText}>{errors.phoneNo}</Text>}

              <InputField
                label="Website"
                value={values.website}
                onBlur={handleBlur('website')}
                onChangeText={handleChange('website')}
                placeholder="www.yourwebsite.com"
              />

              <InputField
                label="Age"
                value={values.age}
                onBlur={handleBlur('age')}
                onChangeText={handleChange('age')}
                placeholder="Your age"
                keyboardType="numeric"
              />

              <View style={styles.section}>
                <Checkbox style={[styles.checkbox, { marginRight: 8 }]} value={keepLoggedIn} onValueChange={setKeepLoggedIn} />
                <Text style={styles.label}>Keep me Logged In</Text>
              </View>

    
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
              >
              
                <Text style={styles.submitButtonText}>Complete Profile</Text>
              
              </TouchableOpacity>

              {show && (
                <CountryPicker
                  show={show}
                  style={styles.countryPicker}
                  pickerButtonOnPress={(item) => {
                    setFieldValue('countryCode',item.dial_code);
                    setShow(false);
                  }}
                  onBackdropPress={() => setShow(false)}
                  androidScrollHeight={300}
                  textStyle={styles.countryPickerText}
                  searchStyle={styles.countryPickerSearch}
                />
              )}
            </View>
          )}
        </Formik>
      </ScrollView>
      <CelebrationModal 
        isVisible={showCelebration}
        onClose={() => {
          setShowCelebration(false);

          navigation.navigate('HomeScreen');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeaderText: {
    color: '#666',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#ffffff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  phoneContainer: {
    marginBottom: 20,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCodeButton: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: 80,
    alignItems: 'center',
  },
  countryCodeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: '#ffffff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
  countryPicker: {
    modal: {
      backgroundColor: '#1A1A1A',
    },
  },
  countryPickerText: {
    color: '#ffffff',
  },
  countryPickerSearch: {
    backgroundColor: '#333',
    color: '#ffffff',
  },
  section: {
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap:'20px',
  }
});