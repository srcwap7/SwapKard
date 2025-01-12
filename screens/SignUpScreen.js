import React from 'react';
import { useState,useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, Button, ImageBackground ,Image} from 'react-native';
import { Formik } from 'formik';
import PinView from '../components/PinView';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';


export default function SignUpScreen() {

  const [mailSent,setMailSent] = useState(false);
  const [isRunning,setRunning] = useState(false);
  const [seconds,setSeconds] = useState(120);
  const [counterOver,setCounterOver] = useState(false);
  const [otpmatched,setOtpmatched] = useState(false);

  const navigation = useNavigation();

  const [email,setEmail] = useState('');
  useEffect(
    ()=>{
      let timer;
      if (seconds>0 && !timer) timer=setInterval(()=>setSeconds((prevSeconds)=>prevSeconds-1),1000);
      else{
        clearInterval(timer);
        setCounterOver(true);
      }
      return ()=>clearInterval(timer);
    },
    [isRunning,seconds]
  )

  return (
    <ImageBackground
      source={require("/home/coromandelexpress/SwapKard/assets/background.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.rootView}>
        {!mailSent &&
            <Formik
                initialValues={{name:'',email:'',password:'',confirmed_password:''}}
                onSubmit={
                    (values) => { 
                        console.log(values);
                        setEmail(values.email);
                        axios.post("http://localhost:8000/api/v1/sendOtp",{email:values.email}).then((res)=>{
                          if (res.status==200){
                            setMailSent(true);
                            setRunning(true);
                          }
                          else{
                            alert("Error in sending Email. Please Ensure you haven't entered an invalid email or you\
                            have an ongoing otp transaction within last 5 minutes");
                          }
                        }).catch((error)=>{
                          console.log(error);
                          alert("Server error. Endpoint unreachable")
                        })
                    }
                }
                validate={(values) => {
                const errors = {};
                if (!values.name) errors.name = "Required";
                if (!values.email) errors.email = "Required";
                else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) errors.email = "Invalid Email";

                if (!values.password) errors.password = "Required";
                else if (values.password.length < 6) errors.password = "Length should be at least 6";

                if (!values.confirmed_password) errors.confirmed_password = "Required";
                else if (values.password !== values.confirmed_password) errors.confirmed_password = "Passwords do not match";

                return errors;
              }}
            >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
                <View style={styles.formContainer}>
                  <Text style={{ color: 'white' }}>Name</Text>
                  <TextInput
                    value={values.name}
                    onBlur={handleBlur('name')}
                    onChangeText={handleChange('name')}
                    placeholder="Name"
                    style={styles.input}
                  />
                  {touched.name && errors.name && (<Text style={styles.errorText}>{errors.name}</Text>)}

                  <Text style={{ color: 'white' }}>Email</Text>
                  <TextInput
                    onBlur={handleBlur('email')}
                    onChangeText={handleChange('email')}
                    value={values.email}
                    placeholder="Email"
                    style={styles.input}
                  />
                  {touched.email && errors.email && (<Text style={styles.errorText}>{errors.email}</Text>)}

                  <Text style={{ color: 'white' }}>Password</Text>
                  <TextInput
                    onBlur={handleBlur('password')}
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    value={values.password}
                    placeholder="Password"
                    style={styles.input}
                  />
                  {touched.password && errors.password && (<Text style={styles.errorText}>{errors.password}</Text>)}

                  <Text style={{ color: 'white' }}>Confirm Password</Text>
                  <TextInput
                    onBlur={handleBlur('confirmed_password')}
                    onChangeText={handleChange('confirmed_password')}
                    value={values.confirmed_password}
                    placeholder="Confirm Password"
                    style={styles.input}
                  />
                  {touched.confirmed_password && errors.confirmed_password && (<Text style={styles.errorText}>{errors.confirmed_password}</Text>)}

                  <Button
                    onPress={handleSubmit}
                    title="Sign Up"
                  />
                </View>
              )}
            </Formik>
        }
        {mailSent && !otpmatched && (<PinView setOtpmatched={setOtpmatched} counterOver={counterOver} seconds={seconds} email={email}/>)}
        { counterOver && !otpmatched && (<Button title="Resend"/>)}
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
    gap:40,
  },
  formContainer: {
    width: '100%',
    alignItems: 'left',
    paddingVertical: 10,
    borderRadius: 10,
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
    color: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  }
});
