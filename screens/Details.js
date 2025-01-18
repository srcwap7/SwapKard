import React from 'react';
import { Text, View, ImageBackground, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function Details({route}) {
  const { cloudinary, name, email, password, token } = route.params;
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      style={styles.background}
    > 
      <ScrollView style={{ flex: 1, marginTop: 40 }}>
        <Formik
          initialValues={{ Role: '', WorksAt: '', phoneNo: '', website: '', age: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.phoneNo) errors.phoneNo = "Phone No Required";
            if (!values.Role) errors.Role = "Role Required";
            if (!values.WorksAt) errors.WorksAt = "WorksAt Required";
            else if (!/^\+\d{1,3}\d{7,12}$/.test(values.phoneNo)) 
              errors.phoneNo = "Phone number must start with a country code (e.g., +123) and be valid.";
            return errors;
          }}
          onSubmit={async(values) => {
            try {
              const res = await axios.post('http://10.50.53.155:5000/api/v1/details', {
                name, email, password,
                avatar: cloudinary,
                job: values.Role,
                workAt: values.WorksAt,
                age: values.age,
              }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              if (res.data.success) {
                console.log("Profile created")
                navigation.navigate('NextScreen');
              } else {
                console.log(res.message)
                alert("Profile not created " + res.message);
              }
            } catch(err) {
              console.log(err)
              alert("Error in sending request. Check your internet connection")
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, touched, values, errors }) => (
            <View style={styles.rootView}>
              <Text style={styles.headerText}>Complete Your Profile</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Professional Role</Text>
                <TextInput
                  value={values.Role}
                  onBlur={handleBlur('Role')}
                  onChangeText={handleChange('Role')}
                  placeholder="e.g. Senior Developer"
                  placeholderTextColor="rgba(255,255,255,0.5)"
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
                  placeholderTextColor="rgba(255,255,255,0.5)"
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
                  placeholderTextColor="rgba(255,255,255,0.5)"
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
                  placeholderTextColor="rgba(255,255,255,0.5)"
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
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  rootView: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  labelText: {
    color: '#e5e5e5',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  input: {
    height: 55,
    width: '100%',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#007AFF',
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
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});