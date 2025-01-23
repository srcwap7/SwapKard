import { React, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';

const PinView = ({ setOtpmatched, counterOver, seconds, email,name,password,resetFlag }) => {
    const navigation = useNavigation();
    const [otp, setOtp] = useState('');

    return (
        <View style={styles.pinView}>
            <OtpInput
                numberOfDigits={4}
                focusColor="green"
                autoFocus={false}
                hideStick={true}
                placeholder="******"
                blurOnFilled={true}
                disabled={false}
                type="numeric"
                secureTextEntry={false}
                focusStickBlinkingDuration={500}
                onTextChange={(value) => {setOtp(value);}}
                onFilled={async (value) => {
                    console.log("Filled OTP:", value);
                    setOtp(value); 
                    try {
                        const res = await axios.post('http://10.50.53.155:5000/api/v1/verify-email', { email: email, otp: value });
                        console.log("Response from server:", res.data);
                        if (res.data.success) {
                            setOtpmatched(true);
                            const jwtToken = res.data.token;
                            if (!resetFlag) navigation.navigate("ProfilePic",{email:email,name:name,password:password,token:jwtToken});
                            else navigation.navigate("ForgotPasswordConfirmation",{email:email,token:jwtToken});
                        } else {
                            setOtpmatched(false);
                            alert("Invalid OTP");
                        }
                    } catch (error) {
                        console.log("Error during OTP verification", error);
                    }
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
                !counterOver && (<Text style={{ color: 'white' }}>Resend OTP after {seconds} seconds</Text>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    pinView: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        color: 'white',
    },
    pinCodeText: {
        color: 'white',
    },
})

export default PinView;
