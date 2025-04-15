import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfilePic from './screens/ProfilePic';
import Details from './screens/Details'
import ForgotPassword from './screens/ForgotPassword';
import ForgotPasswordConfirmation from './screens/ForgotPassConf';
import HomeScreen from './screens/HomeScreen';
import PendingUsersPage from './components/pendingList';
import ContactsPage from './components/contactList';
import EditProfileScreen from './screens/EditProfile';


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
         <Stack.Screen name="HomeScreen" component={HomeScreen} />
         <Stack.Screen name="PendingUsersPage" component={PendingUsersPage} />
         <Stack.Screen name="Connections" component={ContactsPage} />
         <Stack.Screen name="EditPage" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

