import React from 'react';
import { Text, View, ImageBackground, TextInput, Button, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';

export default function Details() {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <Formik
        initialValues={{ Role: '', WorksAt: '', phoneNo: '', website: '' }}
        validate={(values) => {
          const errors = {};
          if (!values.phoneNo) {
            errors.phoneNo = "Phone No Required";
          } else if (!/^\+\d{1,3}\d{7,12}$/.test(values.phoneNo)) {
            errors.phoneNo = "Phone number must start with a country code (e.g., +123) and be valid.";
          }
          return errors;
        }}
        onSubmit={(values) => {
          console.log('Form Values:', values);
          navigation.navigate('NextScreen'); // Replace 'NextScreen' with your actual next screen name
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, touched, values, errors }) => (
          <View style={styles.rootView}>
            <Text style={{ color: 'white' }}>Please fill what role you work as</Text>
            <TextInput
              value={values.Role}
              onBlur={handleBlur('Role')}
              onChangeText={handleChange('Role')}
              placeholder="Role"
              placeholderTextColor="gray"
              style={styles.input}
            />

            <Text style={{ color: 'white' }}>Tell us where you work At</Text>
            <TextInput
              value={values.WorksAt}
              onBlur={handleBlur('WorksAt')}
              onChangeText={handleChange('WorksAt')}
              placeholder="Work Place"
              placeholderTextColor="gray"
              style={styles.input}
            />

            <Text style={{ color: 'white' }}>Enter your Phone No</Text>
            <TextInput
              value={values.phoneNo}
              onBlur={handleBlur('phoneNo')}
              onChangeText={handleChange('phoneNo')}
              placeholder="Phone No"
              placeholderTextColor="gray"
              style={styles.input}
              keyboardType="phone-pad"
            />
            {touched.phoneNo && errors.phoneNo && (
              <Text style={styles.errorText}>{errors.phoneNo}</Text>
            )}

            <Text style={{ color: 'white' }}>Enter your portfolio website</Text>
            <TextInput
              value={values.website}
              onBlur={handleBlur('website')}
              onChangeText={handleChange('website')}
              placeholder="Website"
              placeholderTextColor="gray"
              style={styles.input}
            />

            <Button title="Submit" onPress={handleSubmit} />
          </View>
        )}
      </Formik>
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
