import React from 'react';
import { useState,useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, Button, ImageBackground ,Image} from 'react-native';
import { Formik } from 'formik';
import PinView from '../components/PinView';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';


export default function ForgotPassword() {

  const [mailSent,setMailSent] = useState(false);
  const [isRunning,setRunning] = useState(false);
  const [seconds,setSeconds] = useState(120);
  const [counterOver,setCounterOver] = useState(false);
  const [otpmatched,setOtpmatched] = useState(false);

  const navigation = useNavigation();

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');

  const [resetFlag,setResetFlag] = useState(true);

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
                initialValues={{email:''}}
                onSubmit={
                    (values) => { 
                        console.log(values);
                        setEmail(values.email);
                        axios.post("http://10.50.53.155:5000/api/v1/forgotPasswordMobile",{email:values.email}).then((res)=>{
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
                    if (!values.email) errors.email = "Required";
                    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) errors.email = "Invalid Email";
                    return errors;
              }}    
            >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
                <View style={styles.formContainer}>
                  <Text style={{ color: 'white' }}>Email</Text>
                  <TextInput
                    onBlur={handleBlur('email')}
                    onChangeText={handleChange('email')}
                    value={values.email}
                    placeholder="Email"
                    style={styles.input}
                  />
                  {touched.email && errors.email && (<Text style={styles.errorText}>{errors.email}</Text>)}

                  
                  <Button
                    onPress={handleSubmit}
                    title="Reset Password"
                  />
                </View>
              )}
            </Formik>
        }
        {mailSent && !otpmatched && (<PinView setOtpmatched={setOtpmatched} counterOver={counterOver} seconds={seconds} email={email} name={name} password={password} resetFlag={resetFlag}/>)}
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
