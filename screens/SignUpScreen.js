import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Formik } from 'formik';
import PinView from '../components/PinView';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function SignUpScreen() {
  const [mailSent, setMailSent] = useState(false);
  const [isRunning, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(200);
  const [counterOver, setCounterOver] = useState(false);
  const [otpmatched, setOtpmatched] = useState(false);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetFlag, setResetFlag] = useState(false);

  useEffect(() => {
    let timer;
    if (seconds > 0 && !timer) timer = setInterval(() => setSeconds((prevSeconds) => prevSeconds - 1), 1000);
    else {
      clearInterval(timer);
      setCounterOver(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  return (
    <ScrollView style={styles.background}>
      <View style={styles.rootView}>
        <Text style={styles.headerText}>Create Account</Text>
        
        {!mailSent && (
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmed_password: '' }}
            onSubmit={(values) => {
              setEmail(values.email);
              setPassword(values.password);
              setName(values.name);
              axios.post("http://10.50.53.155:5000/api/v1/sendOtp", { email: values.email })
                .then((res) => {
                  if (res.data.success) {
                    setMailSent(true);
                    setRunning(true);
                  } else {
                    alert("Error in sending Email. Please ensure you haven't entered an invalid email or you have an ongoing OTP transaction within last 5 minutes");
                  }
                }).catch((error) => {
                   const message = error.response ? error.response.data.message : error.message;
                   alert(message);
                });
            }}
            validate={(values) => {
              const errors = {};
              if (!values.name) errors.name = "Required";
              if (!values.email) errors.email = "Required";
              else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) 
                errors.email = "Invalid Email";
              if (!values.password) errors.password = "Required";
              else if (values.password.length < 6) 
                errors.password = "Password must be at least 6 characters";
              if (!values.confirmed_password) errors.confirmed_password = "Required";
              else if (values.password !== values.confirmed_password) 
                errors.confirmed_password = "Passwords do not match";
              return errors;
            }}
          >
            {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.labelText}>Name</Text>
                  <TextInput
                    value={values.name}
                    onBlur={handleBlur('name')}
                    onChangeText={handleChange('name')}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                    style={styles.input}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.labelText}>Email</Text>
                  <TextInput
                    onBlur={handleBlur('email')}
                    onChangeText={handleChange('email')}
                    value={values.email}
                    placeholder="Enter your email"
                    placeholderTextColor="#666"
                    style={styles.input}
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
                    onBlur={handleBlur('password')}
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    value={values.password}
                    placeholder="Create password"
                    placeholderTextColor="#666"
                    style={styles.input}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.labelText}>Confirm Password</Text>
                  <TextInput
                    onBlur={handleBlur('confirmed_password')}
                    onChangeText={handleChange('confirmed_password')}
                    value={values.confirmed_password}
                    placeholder="Confirm password"
                    placeholderTextColor="#666"
                    style={styles.input}
                    secureTextEntry
                  />
                  {touched.confirmed_password && errors.confirmed_password && (
                    <Text style={styles.errorText}>{errors.confirmed_password}</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.signupButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        )}

        {mailSent && !otpmatched && (
          <PinView 
            setOtpmatched={setOtpmatched} 
            counterOver={counterOver} 
            seconds={seconds} 
            email={email} 
            name={name} 
            password={password} 
            resetFlag={resetFlag}
          />
        )}

        {mailSent && counterOver && !otpmatched && (
          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendButtonText}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
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
  signupButton: {
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
  signupButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resendButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C63FF',
    marginTop: 20,
  },
  resendButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});