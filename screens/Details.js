import React, { useState, useRef } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

export default function Details({ route }) {
  const nameRef = useRef(route.params.name);
  const emailRef = useRef(route.params.email);
  const passwordRef = useRef(route.params.password);
  const tokenRef = useRef(route.params.token);
  const cloudinaryRef = useRef(route.params.cloudinary);
  
  const navigation = useNavigation();

  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const userId = useRef('');

  const saveImage = async (fileName, base64Content) => {
    try {

      const userDirectory = `${FileSystem.documentDirectory}user/`;
      const filePath = `${userDirectory}${fileName}`;
      const dirInfo = await FileSystem.getInfoAsync(userDirectory);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(userDirectory, { intermediates: true });
      const cleanBase64Content = base64Content.replace(/^data:image\/\w+;base64,/, '');
      await FileSystem.writeAsStringAsync(filePath,cleanBase64Content,{encoding: FileSystem.EncodingType.Base64,});
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
          isLoggedIn: true,
          keepLoggedIn,
        })
      );
    } catch (error) {
      alert('Failed to save user credentials');
      console.error('Failed to save data securely:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Formik
          initialValues={{ Role: '', WorksAt: '', phoneNo: '', website: '', age: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.phoneNo) errors.phoneNo = 'Phone No Required';
            if (!values.Role) errors.Role = 'Role Required';
            if (!values.WorksAt) errors.WorksAt = 'WorksAt Required';
            else if (!/^\+\d{1,3}\d{7,12}$/.test(values.phoneNo))
              errors.phoneNo = 'Phone number must start with a country code (e.g., +123) and be valid.';
            return errors;
          }}
          onSubmit={async (values) => {
            try {
              const res = await axios.post(
                'http://10.50.53.155:5000/api/v1/details',
                {
                  name: nameRef.current,
                  email: emailRef.current,
                  password: passwordRef.current,
                  avatar: cloudinaryRef.current,
                  job: values.Role,
                  workAt: values.WorksAt,
                  age: values.age,
                },
                {
                  headers: {
                    Authorization: `Bearer ${tokenRef.current}`,
                  },
                }
              );
              if (res.data.success) {
                userId.current = res.data.userId;
                const userBroadcastQR = res.data.qrBroadcast;
                const userPrivateQR = res.data.qrPrivate;
                saveImage(userId.current + '_broadcast.png', userBroadcastQR);
                saveImage(userId.current + '_private.png', userPrivateQR);
                saveSecureData();
              } else {
                console.log(res.message);
                alert('Profile not created ' + res.message);
              }
            } catch (error) {
              const errorMessage = error.response
                ? error.response.data.message
                : 'An error occurred';
              alert(errorMessage);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, touched, values, errors }) => (
            <View style={styles.formContainer}>
              <Text style={styles.headerText}>Complete Your Profile</Text>

              {/* Input fields */}
              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Professional Role</Text>
                <TextInput
                  value={values.Role}
                  onBlur={handleBlur('Role')}
                  onChangeText={handleChange('Role')}
                  placeholder="e.g. Senior Developer"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                {touched.Role && errors.Role && (
                  <Text style={styles.errorText}>{errors.Role}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Company / Organization</Text>
                <TextInput
                  value={values.WorksAt}
                  onBlur={handleBlur('WorksAt')}
                  onChangeText={handleChange('WorksAt')}
                  placeholder="e.g. Google Inc"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                {touched.WorksAt && errors.WorksAt && (
                  <Text style={styles.errorText}>{errors.WorksAt}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Contact Number</Text>
                <TextInput
                  value={values.phoneNo}
                  onBlur={handleBlur('phoneNo')}
                  onChangeText={handleChange('phoneNo')}
                  placeholder="+1 234 567 8900"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                {touched.phoneNo && errors.phoneNo && (
                  <Text style={styles.errorText}>{errors.phoneNo}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Portfolio Website</Text>
                <TextInput
                  value={values.website}
                  onBlur={handleBlur('website')}
                  onChangeText={handleChange('website')}
                  placeholder="www.yourportfolio.com"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Age</Text>
                <TextInput
                  value={values.age}
                  onBlur={handleBlur('age')}
                  onChangeText={handleChange('age')}
                  placeholder="Your age"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

              {/* Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              >
                <Checkbox
                  value={keepLoggedIn}
                  onValueChange={setKeepLoggedIn}
                  color={keepLoggedIn ? '#4A90E2' : undefined}
                />
                <Text style={styles.checkboxText}>Keep me logged in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Complete Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelText: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#ffffff',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 5,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkboxText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});