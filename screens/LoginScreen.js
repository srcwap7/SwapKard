import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function LoginScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.background}>
      <View style={styles.rootView}>
        {/* Logo Image */}
        <Image
          source={require("/home/coromandelexpress/SwapKard/assets/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Welcome Back</Text>

        <Formik
          initialValues={{ email: 'example@gmail.com', password: '' }}
          onSubmit={async(values) => {
            try {
              const res = await axios.post("http://10.50.53.155:5000/api/v1/login", {
                email: values.email,
                password: values.password
              });
              if (res.data.success) {
                console.log("Request Ok")
                navigation.navigate("NextScreen");
              } else {
                console.log("Request failed")
                alert("Invalid Credentials");
              }
            } catch(error) {
              console.log(error);
              alert("Request could not be sent");
            }
          }}
          validate={(values) => {
            const errors = {};
            if (!values.email) errors.email = 'Required';
            else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) 
              errors.email = 'Invalid email address';
            if (!values.password) errors.password = 'Required';
            else if (values.password.length < 6) 
              errors.password = 'Password must be at least 6 characters';
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
    </View>
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
    backgroundColor: '#6C63FF', // Vibrant purple accent
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
    color: '#6C63FF', // Matching accent color
    fontSize: 14,
    fontWeight: '600',
  },
});