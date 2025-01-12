import {React,useState} from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import {useNavigation} from "@react-navigation/native";
import axios from 'axios';

const PinView = ({setOtpmatched,counterOver,seconds,email})=>{
    const navigation = useNavigation();
    const [otp,setOtp] = useState('');
    return(
        <View style={styles.pinView}>
            <OtpInput
                numberOfDigits={6}
                focusColor="green"
                autoFocus={false}
                hideStick={true}
                placeholder="******"
                blurOnFilled={true}
                disabled={false}
                type="numeric"
                secureTextEntry={false}
                focusStickBlinkingDuration={500}
                onTextChange={(value)=>{
                    setOtp(value);
                }}
                onFilled={async() => {
                  await axios.post('http://localhost:5000/api/v1/verify-email',{email:email,otp:otp}).then((res)=>{
                    if(res.data.success){
                      setOtpmatched(true);
                      navigation.navigate("ProfilePic");
                    }
                    else{
                      setOtpmatched(false);
                      alert("Invalid OTP");
                    }
                  })
                }}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
                theme={{
                  containerStyle: styles.container,
                  pinCodeContainerStyle: styles.pinCodeContainer,
                  pinCodeTextStyle: styles.pinCodeText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                  placeholderTextStyle: styles.placeholderText,
                  filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                  disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                }}
            />
            {
              !counterOver && (<Text style={{color:'white'}}>Resend OTP after {seconds}</Text>)
            }
        </View>
    )
}

const styles=StyleSheet.create({
    pinView:{
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        gap:40,
        color:'white',
    },
    pinCodeText:{
      color:'white',
    },
})
export default PinView;