import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Formik } from 'formik';
import PinView from '../components/PinView';
import axios from 'axios';

export default function ForgotPassword() {
  const [mailSent, setMailSent] = useState(false);
  const [isRunning, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const [counterOver, setCounterOver] = useState(false);
  const [otpmatched, setOtpmatched] = useState(false);
  const [email, setEmail] = useState('');
  const [resetFlag] = useState(true);

  useEffect(() => {
    let timer;
    if (seconds > 0 && !timer) {
      timer = setInterval(() => setSeconds((prevSeconds) => prevSeconds - 1), 1000);
    } else {
      clearInterval(timer);
      setCounterOver(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const handleResetPassword = async (values) => {
    try {
      console.log(values);
      setEmail(values.email);
      const res = await axios.post(`http://10.10.209.128:2000/api/v1/forgotPasswordMobile`,{email:values.email});
      if (res.status === 200) {
        setMailSent(true);
        setRunning(true);
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred';
      alert(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.rootView}>
          {!mailSent && (
            <Formik
              initialValues={{ email: '' }}
              onSubmit={handleResetPassword}
              validate={(values) => {
                const errors = {};
                if (!values.email) {
                  errors.email = "Required";
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                  errors.email = "Invalid Email";
                }
                return errors;
              }}
            >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Reset Password</Text>
                  <TextInput
                    onBlur={handleBlur('email')}
                    onChangeText={handleChange('email')}
                    value={values.email}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    style={styles.input}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Send Reset Link</Text>
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

          {counterOver && mailSent && !otpmatched && (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                setSeconds(120);
                setCounterOver(false);
                setRunning(true);
                handleResetPassword({ email });
              }}
            >
              <Text style={styles.buttonText}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    paddingTop: 80,
  },
  rootView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 30,
    borderRadius: 25,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  label: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 25,
    marginVertical: 10,
    paddingHorizontal: 20,
    color: '#ffffff',
    backgroundColor: '#2A2A2A',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
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
  resendButton: {
    backgroundColor: '#5CB85C',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  }
});