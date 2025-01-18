import React from 'react';
import { Text, View, ImageBackground, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';



export default function ForgotPasswordConfirmation({route}) {
  const { email,token } = route.params;
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      style={styles.background}
    > 
      <ScrollView style={{ flex: 1, marginTop:30 }}>
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.password) errors.password = "Password Required";
            else if (values.password.length < 6) errors.password = "Password must be at least 6 characters";
            if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match";
            return errors;        
          }}
          onSubmit={async(values) => {
            try{
              const res = await axios.post('http://10.50.53.155:5000/api/v1/resetPasswordMobile',{
                email:email,
                password:values.password,
              },
              {
                headers:{
                  Authorization: `Bearer ${token}`
                }
              });
              if (res.data.success){
                alert("Password updated successfully");
                navigation.navigate('LoginScreen');
              }
              else{
                console.log(res.message)
                alert("Profile not created ",res.message);
              }
            }
            catch(err){
              console.log(err)
              alert("Error in sending request. Check your internet connection")
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, touched, values, errors }) => (
            <View style={styles.rootView}>
              <Text style={{ color: 'white' }}>Please fill a password of at least length 6</Text>
              <TextInput
                value={values.password}
                onBlur={handleBlur('password')}
                onChangeText={handleChange('password')}
                placeholder="Password"
                placeholderTextColor="gray"
                style={styles.input}
              />
              {touched.password && errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}

              <Text style={{ color: 'white' }}>Confirm Password</Text>
              <TextInput
                value={values.confirmPassword}
                onBlur={handleBlur('confirmPassword')}
                onChangeText={handleChange('confirmPassword')}
                placeholder="confirm password"
                placeholderTextColor="gray"
                style={styles.input}
              />

              {touched.confirmPassword && errors.confirmPassword && (<Text style={styles.errorText}>{errors.confirmPassword}</Text>)}


              <Button title="Submit" onPress={handleSubmit} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  input: {
    height: 40,
    width: 250,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
    color: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});
