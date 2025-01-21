import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function Details({ route }) {
  const { cloudinary, name, email, password, token } = route.params;
  const navigation = useNavigation();

  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userBroadcastQR, setUserBroadcastQR] = useState(false);
  const [userPrivateQR, setUserPrivateQR] = useState(false);

  const saveSecureData = async () => {
    try {
      await SecureStore.setItemAsync(
        'user_data',
        JSON.stringify({
          email,
          password,
          name,
          userId,
          profilePicUrl: cloudinary,
          userBroadcastQR,
          userPrivateQR,
          isLoggedIn: true,
          keepLoggedIn,
        })
      );
      console.log('Data saved securely');
    } catch (error) {
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
                  name,
                  email,
                  password,
                  avatar: cloudinary,
                  job: values.Role,
                  workAt: values.WorksAt,
                  age: values.age,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (res.data.success) {
                console.log('Profile created');
                setUserId(res.data.user._id);
                setUserBroadcastQR(res.data.qrBroadcast);
                setUserPrivateQR(res.data.qrPrivate);
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
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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
                  color={keepLoggedIn ? '#ff00ff' : undefined}
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
    backgroundColor: '#121212',
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelText: {
    color: '#ffffff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxText: {
    color: '#ffffff',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#ff00ff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});
