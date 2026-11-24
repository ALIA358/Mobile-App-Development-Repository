import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { auth, db } from '../firebaseConfig'; // Firebase config import
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth API
import { doc, setDoc } from 'firebase/firestore'; // Firestore to save user profile name

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Auth API call to create user
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Save user name in Firestore database
      await setDoc(doc(db, "users", user.uid), {
        fullName: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString()
      });

      alert('Account created successfully!');
      navigation.replace('Home');
    } catch (error) {
      alert('Signup Failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.innerContainer}>
        
        <View style={globalStyles.headerBox}>
          <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
          <Text style={globalStyles.title}>Create Account</Text>
          <Text style={globalStyles.subtitle}>Register new staff or admin profile</Text>
        </View>

        <View style={globalStyles.formCard}>
          <Text style={globalStyles.inputLabel}>Full Name *</Text>
          <TextInput 
            style={globalStyles.textInput}
            placeholder="e.g. Ali Khan"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <Text style={globalStyles.inputLabel}>Email Address *</Text>
          <TextInput 
            style={globalStyles.textInput}
            placeholder="admin@orphanage.com"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={globalStyles.inputLabel}>Password *</Text>
          <TextInput 
            style={globalStyles.textInput}
            placeholder="Create a password"
            placeholderTextColor="#888"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[globalStyles.loginButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={globalStyles.loginButtonText}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.switchRow}
            onPress={() => navigation.goBack()}
          >
            <Text style={globalStyles.switchText}>Already have an account? <Text style={{fontWeight: 'bold', color: '#0D47A1'}}>Login</Text></Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}