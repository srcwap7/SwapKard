import React, { useState } from 'react';
import { useSelector,useDispatch } from 'react-redux'; 
import * as SecureStore from 'expo-secure-store';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

const EditProfileScreen = ({route}) => {
  const [activeField, setActiveField] = useState(null);
  const {socket} = route.params;

  const userObject = useSelector((state)=>state.user);
  const dispatch = useDispatch();

  const originalName = userObject.user.name;
  const originalEmail = userObject.user.email;
  const originalPhone = userObject.user.phone;
  
  const [name, setName] = useState(originalName);
  const [email, setEmail] = useState(originalEmail);
  const [phone, setPhone] = useState(originalPhone);

  const updateSecureDataKey = async (keyToUpdate, newValue) => {
    try {
      const data = await SecureStore.getItemAsync('user_data');
      if (data) {
        const parsedData = JSON.parse(data);
        parsedData[keyToUpdate] = newValue;
        await SecureStore.setItemAsync('user_data', JSON.stringify(parsedData));
        console.log(`Updated '${keyToUpdate}' to:`, newValue);
      } else {
        console.warn('No secure data found to update.');
      }
    } catch (error) {
      console.error('Failed to update secure data key:', error);
    }
  };
  
  const handleSave = async() => {
    if (!activeField) return;
    let fieldChanged = '';
    let newData = '';
    if (activeField === 'name') {
      fieldChanged = 'name';
      newData = name;
    } else if (activeField === 'email') {
      fieldChanged = 'email';
      newData = email;
    } else if (activeField === 'phone') {
      fieldChanged = 'phone';
      newData = phone;
    }
    console.log(`Updating ${fieldChanged}: ${newData}`);
    await updateSecureDataKey(fieldChanged,newData);
    if (fieldChanged === "name") dispatch({type:'CHANGE_NAME',payload:{newName:name}});
    else if (fieldChanged === "email") dispatch({type:'CHANGE_EMAIL',payload:{newEmail:email}});
    else if (fieldChanged === "phone") dispatch({type:'CHANGE_PHONE',payload:{newPhone:phone}});
    socket.emit('changedDetails',{_id:userObject.user.id,fieldChanged:fieldChanged,newData:newData});
    setActiveField(null); 
  };

  const handleCancel = () => {
    if (activeField === 'name') setName(originalName);
    if (activeField === 'email') setEmail(originalEmail);
    if (activeField === 'phone') setPhone(originalPhone);
    setActiveField(null);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Edit Profile</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setActiveField('name');
          }}
          placeholder="Enter name"
          style={styles.input}
          editable={!activeField || activeField === 'name'}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setActiveField('email');
          }}
          placeholder="Enter email"
          style={styles.input}
          keyboardType="email-address"
          editable={!activeField || activeField === 'email'}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setActiveField('phone');
          }}
          placeholder="Enter phone number"
          style={styles.input}
          keyboardType="phone-pad"
          editable={!activeField || activeField === 'phone'}
          placeholderTextColor="#aaa"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: activeField ? '#007AFF' : '#ccc' },
        ]}
        onPress={handleSave}
        disabled={!activeField}
      >
        <Text style={styles.buttonText}>Save {activeField || ''}</Text>
      </TouchableOpacity>

      {activeField && (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ef4444' }]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        )}
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate-900
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: '#cbd5e1', // Slate-300
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1e293b', // Slate-800
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6', // Blue-500
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
