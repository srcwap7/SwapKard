import React from 'react';
import { 
  View,
  Text, 
  StyleSheet, 
  TextInput, 
  Button, 
  ImageBackground, 
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Formik } from 'formik';
import { useNavigation} from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("/home/coromandelexpress/SwapKard/assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.rootView}>
        {/* Logo Image */}
        <Image
          source={require("/home/coromandelexpress/SwapKard/assets/logo.png")}
          style={styles.logo}
        />
        
        <Formik
          initialValues={{ email: 'example@gmail.com', password: '' }}
          onSubmit={() => {
            console.log('Submitted');
          }}
          validate={(values) => {
            const errors = {};
            if (!values.email) errors.email = 'Required';
            else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) errors.email = 'Not Valid';

            if (!values.password) errors.password = 'Required';
            else if (values.password.length < 6) errors.password = 'Length Should be at least 6';
            return errors;
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <View style={styles.formContainer}>
              <Text style={{color:'white'}}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <Text style={{color:'white'}}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <Button
                onPress={handleSubmit}
                title="Login"
              />
            </View>
          )}
        </Formik>
        
        <View style={{display:'flex',flexDirection:'row'}}>
          <Text style={{color:'white'}}> New Here ? </Text>
          <TouchableOpacity onPress={()=>navigation.navigate("SignUp")}>
            <Text style={{color:'pink'}}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    color:'white'
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'left',
    paddingVertical: 10,
    borderRadius: 10,
    color:'white',
    paddingHorizontal: 20, 
    marginTop: 30, 
  },
  input: {
    height: 40,
    width: 250, 
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10, 
    paddingHorizontal: 10,
    color:'white'
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});
