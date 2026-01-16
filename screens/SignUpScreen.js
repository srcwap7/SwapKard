import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import PinView from '../components/PinView';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

export default function SignUpScreen() {
  const [mailSent, setMailSent] = useState(false);
  const [isRunning, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(200);
  const [counterOver, setCounterOver] = useState(false);
  const [otpmatched, setOtpmatched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const email = useRef('');
  const password = useRef('');
  const name = useRef('');
  const resetFlag = useRef(false);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.rootView}>
          <Text style={styles.headerText}>Create Account</Text>
          {!mailSent && (
            <Formik
              initialValues={{ name: '', email: '', password: '', confirmed_password: '' }}
              onSubmit={(values) => {
                email.current = values.email;
                password.current = values.password;
                name.current = values.name;
                axios.post(`http://10.10.209.128:2000/api/v1/sendOtp`, { email: values.email })
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
                    <View style={styles.passwordContainer}>
                      <TextInput
                        onBlur={handleBlur('password')}
                        onChangeText={handleChange('password')}
                        secureTextEntry={!showPassword}
                        value={values.password}
                        placeholder="Create password"
                        placeholderTextColor="#666"
                        style={styles.input}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#888" />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.labelText}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        onBlur={handleBlur('confirmed_password')}
                        onChangeText={handleChange('confirmed_password')}
                        secureTextEntry={!showConfirmPassword}
                        value={values.confirmed_password}
                        placeholder="Confirm password"
                        placeholderTextColor="#666"
                        style={styles.input}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#888" />
                      </TouchableOpacity>
                    </View>
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
              email={email.current}
              name={name.current}
              password={password.current}
              resetFlag={resetFlag.current}
            />
          )}
          {mailSent && counterOver && !otpmatched && (
            <TouchableOpacity style={styles.resendButton}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { flexGrow: 1, backgroundColor: '#121212', justifyContent: 'center', paddingTop: 80 },
  rootView: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  headerText: { fontSize: 28, fontWeight: '600', color: '#ffffff', marginBottom: 30, letterSpacing: 0.5 },
  formContainer: { width: '100%', maxWidth: 340, marginVertical: 20 },
  inputGroup: { marginBottom: 20 },
  labelText: { color: '#ffffff', fontSize: 16, marginBottom: 8, fontWeight: '500' },
  input: { flex: 1, height: 50, backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 16, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#333', backgroundColor: '#1E1E1E' },
  eyeIcon: { padding: 10 },
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 5, fontWeight: '500' },
  signupButton: { backgroundColor: '#6C63FF', paddingVertical: 15, borderRadius: 12, marginTop: 10 },
  signupButtonText: { color: '#ffffff', textAlign: 'center', fontSize: 18, fontWeight: '600', letterSpacing: 0.5 }
});