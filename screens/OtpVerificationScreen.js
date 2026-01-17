import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from 'axios';

export default function OtpVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, name, password, resetFlag } = route.params;
  
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(200);
  const [counterOver, setCounterOver] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else {
      setCounterOver(true);
    }
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const res = await axios.post(`http://10.50.52.157:2000/api/v1/sendOtp`, { email });
      if (res.data.success) {
        setSeconds(200);
        setCounterOver(false);
        alert("OTP resent successfully!");
      } 
      else alert("Failed to resend OTP. Please try again.");
    } 
    catch (error) {
      const message = error.response ? error.response.data.message : error.message;
      alert(message);
    } 
    finally {setIsResending(false);}
  };

  const handleOtpFilled = async (value) => {
    console.log("Filled OTP:", value);
    setOtp(value);
    
    try {
      const res = await axios.post(`http://10.50.52.157:2000/api/v1/verify-email`, { 
        email: email, 
        otp: value 
      });
      
      console.log("Response from server:", res.data);
      
      if (res.data.success) {
        const jwtToken = res.data.token;
        console.log(jwtToken);
        
        if (!resetFlag) {
          navigation.replace("ProfilePic", {
            email: email,
            name: name,
            password: password,
            token: jwtToken
          });
        } else {
          navigation.replace("ForgotPasswordConfirmation", {
            email: email,
            token: jwtToken
          });
        }
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.log("Error during OTP verification", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.rootView}>
          <Text style={styles.headerText}>Verify Your Email</Text>
          <Text style={styles.subHeaderText}>
            We've sent a verification code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={4}
              focusColor="#6C63FF"
              autoFocus={true}
              hideStick={true}
              placeholder="****"
              blurOnFilled={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onTextChange={(value) => setOtp(value)}
              onFilled={handleOtpFilled}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
              }}
              theme={{
                containerStyle: styles.otpInputContainer,
                pinCodeContainerStyle: styles.pinCodeContainer,
                pinCodeTextStyle: styles.pinCodeText,
                focusStickStyle: styles.focusStick,
                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                placeholderTextStyle: styles.placeholderText,
                filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
              }}
            />
          </View>

          {!counterOver && (
            <Text style={styles.timerText}>
              Resend OTP in {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </Text>
          )}

          {counterOver && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={isResending}
            >
              <Text style={styles.resendButtonText}>
                {isResending ? "Sending..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  scrollContent: { 
    flexGrow: 1, 
    backgroundColor: '#121212', 
    justifyContent: 'center', 
    paddingTop: 80 
  },
  rootView: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  headerText: { 
    fontSize: 28, 
    fontWeight: '600', 
    color: '#ffffff', 
    marginBottom: 10, 
    letterSpacing: 0.5 
  },
  subHeaderText: { 
    fontSize: 16, 
    color: '#999', 
    marginBottom: 5, 
    textAlign: 'center' 
  },
  emailText: { 
    fontSize: 16, 
    color: '#6C63FF', 
    marginBottom: 40, 
    fontWeight: '600' 
  },
  otpContainer: { 
    width: '100%', 
    maxWidth: 340, 
    marginVertical: 20 
  },
  otpInputContainer: { 
    width: '100%', 
    gap: 12 
  },
  pinCodeContainer: { 
    backgroundColor: '#1E1E1E', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 12, 
    width: 60, 
    height: 60 
  },
  pinCodeText: { 
    color: '#ffffff', 
    fontSize: 24, 
    fontWeight: '600' 
  },
  focusStick: { 
    backgroundColor: '#6C63FF' 
  },
  activePinCodeContainer: { 
    borderColor: '#6C63FF', 
    borderWidth: 2 
  },
  placeholderText: { 
    color: '#666', 
    fontSize: 24 
  },
  filledPinCodeContainer: { 
    backgroundColor: '#2A2A2A', 
    borderColor: '#6C63FF' 
  },
  disabledPinCodeContainer: { 
    backgroundColor: '#1A1A1A', 
    borderColor: '#222' 
  },
  timerText: { 
    color: '#999', 
    fontSize: 14, 
    marginTop: 20, 
    fontWeight: '500' 
  },
  resendButton: { 
    backgroundColor: 'transparent', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    marginTop: 20, 
    borderWidth: 1, 
    borderColor: '#6C63FF' 
  },
  resendButtonText: { 
    color: '#6C63FF', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  backButton: { 
    marginTop: 30 
  },
  backButtonText: { 
    color: '#999', 
    fontSize: 14, 
    textDecorationLine: 'underline' 
  }
});