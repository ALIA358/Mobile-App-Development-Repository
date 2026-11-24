import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity,  Platform, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={globalStyles.container}>
      <TouchableOpacity 
        onPress={() => navigation.replace('Login')} 
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>
      {/* Top Header */}
      <View style={globalStyles.header}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
        </View>

        <Text style={globalStyles.dashboardTitle}>Dashboard</Text>

        <TouchableOpacity style={globalStyles.profileIconContainer}
        onPress={() => navigation.navigate('Profile')}>
          <Text style={globalStyles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 10 }}>
        
        {/* Main Light Pink Enclosing Container */}
        <View style={globalStyles.mainCardContainer}>
          
          <View style={globalStyles.gridRow}>
            {/* 1. Child Welfare Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#8bc6da' }]} 
              onPress={() => navigation.navigate('ChildWelfare')}
            >
              <Text style={globalStyles.moduleEmoji}>👶</Text>
              <Text style={globalStyles.moduleNameText}>Child Welfare</Text>
              <Text style={globalStyles.moduleDetailsText}>Profile, Health & educational records</Text>
            </TouchableOpacity>

            {/* 2. Inventory Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#DCEDC8' }]} 
              onPress={() => navigation.navigate('Inventory')}
            >
              <Text style={globalStyles.moduleEmoji}>📦</Text>
              <Text style={globalStyles.moduleNameText}>Inventory</Text>
              <Text style={globalStyles.moduleDetailsText}>Supplies, stock & asset tracking</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.gridRow}>
            {/* 3. Donations Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#f5f1cd' }]} 
              onPress={() => navigation.navigate('Donation')}
            >
              <Text style={globalStyles.moduleEmoji}>🎁</Text>
              <Text style={globalStyles.moduleNameText}>Donations</Text>
              <Text style={globalStyles.moduleDetailsText}>Logs, receipts & transparency</Text>
            </TouchableOpacity>

            {/* 4. Staff & Admin Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#E1BEE7' }]} 
              onPress={() => navigation.navigate('Staff')}
            >
              <Text style={globalStyles.moduleEmoji}>👥</Text>
              <Text style={globalStyles.moduleNameText}>Staff & Admin</Text>
              <Text style={globalStyles.moduleDetailsText}>Attendance, shifts & tasks</Text>
            </TouchableOpacity>
          </View>
          <View style={globalStyles.gridRow}>
            {/* Reports & Analytics Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#E0F7FA' }]} 
              onPress={() => navigation.navigate('History')}
            >
              <Text style={globalStyles.moduleEmoji}>📊</Text>
              <Text style={globalStyles.moduleNameText}>Reports & History</Text>
              <Text style={globalStyles.moduleDetailsText}>Admissions, expenses & medical trends</Text>
            </TouchableOpacity>

            {/* Adoption & Case Management Card */}
            <TouchableOpacity 
              style={[globalStyles.moduleCard, { backgroundColor: '#edbba6' }]} 
              onPress={() => navigation.navigate('Adoption')}
            >
              <Text style={globalStyles.moduleEmoji}>📝</Text>
              <Text style={globalStyles.moduleNameText}>Adoption & Cases</Text>
              <Text style={globalStyles.moduleDetailsText}>Applications, reviews & legal records</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
