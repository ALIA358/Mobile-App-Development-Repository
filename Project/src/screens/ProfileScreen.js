import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { auth } from '../firebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const currentUser = auth.currentUser;
  const userEmail = currentUser?.email || 'irum@admin.com';

  const defaultName = currentUser?.displayName 
    || userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);

  const [displayName, setDisplayName] = useState(defaultName);
  const [phoneNo, setPhoneNo] = useState('+92 300 1234567');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  const [tempName, setTempName] = useState(displayName);
  const [tempPhone, setTempPhone] = useState(phoneNo);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const routes = navigation.getState()?.routeNames || [];
      const loginRoute = routes.includes('Login') ? 'Login' : routes.includes('login') ? 'login' : routes[0];
      if (loginRoute) {
        navigation.replace(loginRoute);
      }
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!tempName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: tempName.trim() });
      }
      setDisplayName(tempName.trim());
      setPhoneNo(tempPhone.trim());
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@carebridge.org?subject=Support Inquiry');
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      
      <TouchableOpacity 
        onPress={() => navigation.replace('Home')} 
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 14 }}>
        <Text style={[globalStyles.dashboardTitle, { fontSize: 22, fontWeight: 'bold', textAlign: 'center' }]}>
          Profile & Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* User Info Card using globalStyles */}
        <View style={[globalStyles.mainCardContainerChild, globalStyles.compactUserCard]}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', color: '#0D47A1', fontSize: 22 }}>
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{displayName}</Text>
          <Text style={{ fontSize: 12, color: '#555' }}>{userEmail} • {phoneNo}</Text>
        </View>

        <Text style={[globalStyles.sectionHeaderSmall, { marginBottom: 8 }]}>📖 Help & Support</Text>

        {/* Support Options Section using globalStyles */}
        <View style={[globalStyles.mainCardContainerChild, globalStyles.supportContainer]}>
          
          <TouchableOpacity 
            style={globalStyles.supportRowButton}
            onPress={() => {
              setTempName(displayName);
              setTempPhone(phoneNo);
              setEditModalVisible(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17 }}>✏️</Text>
              <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>Edit Profile Information</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#0D47A1' }}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.supportRowButton}
            onPress={handleContactSupport}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17 }}>✉️</Text>
              <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>Contact Support</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#0D47A1' }}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.supportRowButton}
            onPress={() => setFaqModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17 }}>❓</Text>
              <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>FAQ Section</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#0D47A1' }}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.supportRowButton}
            onPress={() => setGuideModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17 }}>📖</Text>
              <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>User Guide & App Manual</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#0D47A1' }}>➔</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity 
          style={[globalStyles.saveButton, { backgroundColor: '#D32F2F', marginTop: 0, marginBottom: 0, width: '100%' }]}
          onPress={handleLogout}
        >
          <Text style={globalStyles.saveButtonText}>🔒 Logout Securely</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeaderRow}>
              <Text style={globalStyles.modalTitle}>Edit Profile Information</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={globalStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={globalStyles.inputLabel}>Full Name *</Text>
              <TextInput style={globalStyles.textInput} value={tempName} onChangeText={setTempName} />
              <Text style={globalStyles.inputLabel}>Phone Number *</Text>
              <TextInput style={globalStyles.textInput} keyboardType="phone-pad" value={tempPhone} onChangeText={setTempPhone} />
              <TouchableOpacity style={globalStyles.saveButton} onPress={handleSaveProfile}>
                <Text style={globalStyles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FAQ MODAL */}
      <Modal animationType="slide" transparent={true} visible={faqModalVisible} onRequestClose={() => setFaqModalVisible(false)}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeaderRow}>
              <Text style={globalStyles.modalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setFaqModalVisible(false)}>
                <Text style={globalStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={globalStyles.modalHeadingText}>Q: How do records sync in real-time?</Text>
              <Text style={globalStyles.modalBodyText}>A: All modules are backed by Firebase Firestore cloud database, ensuring instant synchronization across devices.</Text>
              
              <Text style={globalStyles.modalHeadingText}>Q: Can staff track attendance?</Text>
              <Text style={globalStyles.modalBodyText}>A: Yes, the Staff Administration module allows one-tap presence toggle and real-time directory management.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* USER GUIDE MODAL */}
      <Modal animationType="slide" transparent={true} visible={guideModalVisible} onRequestClose={() => setGuideModalVisible(false)}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeaderRow}>
              <Text style={globalStyles.modalTitle}>User Guide & System Workflow</Text>
              <TouchableOpacity onPress={() => setGuideModalVisible(false)}>
                <Text style={globalStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={globalStyles.modalPrimaryTitle}>How CareBridge Works:</Text>
              <Text style={globalStyles.modalParagraph}>
                CareBridge is a cloud-synced Orphanage Management System designed to streamline shelter operations. It connects user login credentials with live Firestore collections to manage end-to-end orphan care securely.
              </Text>

              <Text style={globalStyles.modalHeadingText}>1. Child Welfare Module:</Text>
              <Text style={globalStyles.modalBodyText}>Manages digital dossiers, medical records, schooling history, and dormitory assignments.</Text>

              <Text style={globalStyles.modalHeadingText}>2. Adoption Management Module:</Text>
              <Text style={globalStyles.modalBodyText}>Tracks prospective parent applications, legal clearances, and verifies requests against resident children.</Text>

              <Text style={globalStyles.modalHeadingText}>3. Inventory Supplies Module:</Text>
              <Text style={globalStyles.modalBodyText}>Catalogs food, medical, clothing, and stationery stock with real-time low-stock alerts.</Text>

              <Text style={globalStyles.modalHeadingText}>4. Donation Management Module:</Text>
              <Text style={globalStyles.modalBodyText}>Logs monetary and in-kind contributions to ensure complete financial transparency.</Text>

              <Text style={globalStyles.modalHeadingText}>5. Staff Administration Module:</Text>
              <Text style={globalStyles.modalBodyText}>Maintains staff directories across roles and handles daily attendance tracking.</Text>

              <Text style={globalStyles.modalHeadingText}>6. History & Analytics Dashboard:</Text>
              <Text style={globalStyles.modalBodyText}>Calculates live demographic metrics, operational expenses, and generates downloadable PDF reports.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}