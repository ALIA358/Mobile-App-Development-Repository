import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { auth } from '../firebaseConfig'; // Firebase config import
import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth API

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@orphanage.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Firebase Authentication API call
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Successful login -> Navigate to Home Dashboard
      navigation.replace('Home');
    } catch (error) {
      alert('Login Failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
return (
        <SafeAreaView style={globalStyles.container}>
          <View style={globalStyles.innerContainer}>
            
            <View style={globalStyles.headerBox}>
              <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
              <Text style={[globalStyles.title, { color: '#222', fontWeight: 'bold' }]}>Welcome Back!</Text>
              <Text style={[globalStyles.subtitle, { color: '#333', fontWeight: '500' }]}>Sign in to manage orphanage operations</Text>
            </View>

            <View style={globalStyles.formCard}>
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
                placeholder="Enter your password"
                placeholderTextColor="#888"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity 
                style={[globalStyles.loginButton, isLoading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={globalStyles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={globalStyles.switchRow}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={globalStyles.switchText}>
                  Don't have an account? <Text style={{fontWeight: 'bold', color: '#0D47A1'}}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>   
  );
}