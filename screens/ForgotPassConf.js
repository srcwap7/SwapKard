import React from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function ForgotPasswordConfirmation({route}) {
  const { email, token } = route.params;
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ScrollView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validate={(values) => {
              const errors = {};
              if (!values.password) {
                errors.password = "Password Required";
              } else if (values.password.length < 6) {
                errors.password = "Password must be at least 6 characters";
              }
              if (values.password !== values.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
              }
              return errors;
            }}
            onSubmit={async(values) => {
              try {
                const res = await axios.post('https://swapkard.onrender.com/api/v1/resetPasswordMobile',
                  {
                    email: email,
                    password: values.password,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                );
                if (res.data.success) {
                  alert("Password updated successfully");
                  navigation.navigate('LoginScreen');
                } else {
                  console.log(res.message);
                  alert("Profile not created " + res.message);
                }
              } catch (error) {
                const errorMessage = error.response ? error.response.data.message : 'An error occurred';
                alert(errorMessage);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, touched, values, errors }) => (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Reset Password</Text>
                
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  value={values.password}
                  onBlur={handleBlur('password')}
                  onChangeText={handleChange('password')}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  style={styles.input}
                  secureTextEntry
                />
                {touched.password && errors.password && 
                  <Text style={styles.errorText}>{errors.password}</Text>
                }

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  value={values.confirmPassword}
                  onBlur={handleBlur('confirmPassword')}
                  onChangeText={handleChange('confirmPassword')}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  style={styles.input}
                  secureTextEntry
                />
                {touched.confirmPassword && errors.confirmPassword && 
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                }

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 25,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  title: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    color: '#ffffff',
    backgroundColor: '#2A2A2A',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  }
});