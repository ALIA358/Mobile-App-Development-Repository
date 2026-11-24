import React, { useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Platform, StatusBar, Image  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
export default function SplashScreen({ navigation }) {
  
  // built-in useEffect hook
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // 2 second then Login screen 
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
  
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.content}>
        <View style={globalStyles.logoCircle}>
          <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
        </View>
        
        <Text style={globalStyles.appName}>ORPHANAGE</Text>
        <Text style={globalStyles.tagline}>Empowering lives through secure shelter, care & transparency.</Text>
      </View>
    </SafeAreaView>

  );
}
