import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfilePic from './screens/ProfilePic';
import Details from './screens/Details'
import ForgotPassword from './screens/ForgotPassword';
import ForgotPasswordConfirmation from './screens/ForgotPasswordConfirmation';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
         <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name="SignUp" component={SignUpScreen} />
         <Stack.Screen name="ProfilePic" component={ProfilePic} />
         <Stack.Screen name="Details" component={Details} />
         <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
         <Stack.Screen name="ForgotPasswordConfirmation" component={ForgotPasswordConfirmation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

