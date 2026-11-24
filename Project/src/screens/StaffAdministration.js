import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function StaffAdministration({ navigation }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const filters = ['All', 'Admin', 'Caretaker', 'Medical', 'Teacher'];

  // Fetch Cloud Data from Firebase Firestore on Load
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "staff"));
        const data = querySnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setStaff(data);
      } catch (error) {
        console.log("Cloud fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Strict Input Sanitization Handlers
  const handleNameChange = (text) => {
    // Sirf alphabets aur spaces allow hain
    const cleaned = text.replace(/[^a-zA-Z\s.]/g, '');
    setName(cleaned);
  };

  const handleRoleChange = (text) => {
    // Sirf alphabets allow hain
    const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setRole(cleaned);
  };

  const handleContactChange = (text) => {
    // Sirf digits aur '+' allow hain
    const cleaned = text.replace(/[^0-9+]/g, '');
    setContact(cleaned);
  };

  // Add Staff Member to Firebase Firestore
  const addStaff = async () => {
    if (!name.trim() || !role.trim() || !contact.trim()) {
      Alert.alert('Error', 'Please fill in all staff fields.');
      return;
    }

    const newStaffMember = {
      name: name.trim(),
      role: role.trim(),
      contact: contact.trim(),
      attendance: 'Not Marked'
    };

    try {
      const docRef = await addDoc(collection(db, "staff"), newStaffMember);
      const savedStaff = { id: docRef.id, ...newStaffMember };

      setStaff(previous => [...previous, savedStaff]);

      setName('');
      setRole('');
      setContact('');
      setShowForm(false);

      Alert.alert('Success', 'Staff member added to Cloud successfully!');
    } catch (error) {
      Alert.alert('Firebase Error: ' + error.message);
    }
  };

  // Mark Attendance in Firebase Firestore
  const markAttendance = async (id, currentAttendance) => {
    const newAttendanceState = currentAttendance === 'Present' ? 'Absent' : 'Present';

    try {
      const docRef = doc(db, "staff", id);
      await updateDoc(docRef, { attendance: newAttendanceState });

      setStaff(previous =>
        previous.map(item =>
          item.id === id
            ? { ...item, attendance: newAttendanceState }
            : item
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance: ' + error.message);
    }
  };

  const filteredStaff = staff.filter(item => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.role?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      item.role?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const presentCount = staff.filter(
    item => item.attendance === 'Present'
  ).length;

  const absentCount = staff.filter(
    item => item.attendance === 'Absent'
  ).length;

  return (
    <SafeAreaView style={globalStyles.container}>

      {/* BACK ARROW */}
      <TouchableOpacity
        onPress={() => navigation.replace('Home')}
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>
     
        <View style={globalStyles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={globalStyles.logoIcon}
          />
          <Text style={globalStyles.dashboardTitle}>
            Staff & Administration
          </Text>
          <TouchableOpacity
            style={globalStyles.profileIconContainer}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={globalStyles.profileEmoji}>👤</Text>
          </TouchableOpacity>
        </View>
     

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>
            Staff Records
          </Text>

          <TouchableOpacity
            style={globalStyles.registerButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={globalStyles.registerButtonText}>
              {showForm ? '− Close' : '+ Register Staff'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={globalStyles.formCard}>
            <Text style={globalStyles.sectionHeaderSmall}>
              Register New Staff Member
            </Text>

            <Text style={globalStyles.inputLabel}>Staff Name (Letters Only) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter staff name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={handleNameChange}
            />

            <Text style={globalStyles.inputLabel}>Role (Admin, Teacher, Nurse...) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter role"
              placeholderTextColor="#888"
              value={role}
              onChangeText={handleRoleChange}
            />

            <Text style={globalStyles.inputLabel}>Contact Number (Digits Only) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter contact number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              maxLength={13}
              value={contact}
              onChangeText={handleContactChange}
            />

            <TouchableOpacity
              style={globalStyles.saveButton}
              onPress={addStaff}
            >
              <Text style={globalStyles.saveButtonText}>
                Save Staff Member
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={globalStyles.searchInput}
          placeholder="Search by name or role..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[globalStyles.filterChipsRow, { marginBottom: 12 }]}
        >
          {filters.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                globalStyles.filterChip,
                filter === item && globalStyles.filterChipActive
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  globalStyles.filterChipText,
                  filter === item && globalStyles.filterChipTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={globalStyles.mainCardContainer}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 12 }]}>
            Staff Directory
          </Text>

          {loading ? (
            <Text style={globalStyles.noRecordText}>Loading cloud records...</Text>
          ) : filteredStaff.length === 0 ? (
            <Text style={globalStyles.noRecordText}>
              No staff records found in Cloud.
            </Text>
          ) : (
            filteredStaff.map(item => (
              <View
                key={item.id}
                style={globalStyles.childCard}
              >
                <View style={globalStyles.avatarPlaceholder}>
                  <Text style={globalStyles.childNameText}>
                    {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={globalStyles.childNameText}>
                    {item.name}
                  </Text>
                  <Text style={globalStyles.childDetailsText}>
                    Role: {item.role}
                  </Text>
                  <Text style={globalStyles.caseText}>
                    Attendance: {item.attendance}
                  </Text>

                  {selectedStaff === item.id && (
                    <View style={[globalStyles.modalDataBox, { marginTop: 8 }]}>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Staff Name:</Text> {item.name}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Role:</Text> {item.role}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Contact:</Text> {item.contact}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Attendance:</Text> {item.attendance}
                      </Text>

                      <TouchableOpacity
                        style={[globalStyles.updateButton, { backgroundColor: '#1E88E5', marginTop: 8 }]}
                        onPress={() => markAttendance(item.id, item.attendance)}
                      >
                        <Text style={globalStyles.updateButtonText}>
                          Mark {item.attendance === 'Present' ? 'Absent' : 'Present'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={globalStyles.viewDossierBtn}
                  onPress={() =>
                    setSelectedStaff(
                      selectedStaff === item.id ? null : item.id
                    )
                  }
                >
                  <Text style={globalStyles.viewDossierText}>
                    {selectedStaff === item.id ? 'Hide' : 'Details →'}
                  </Text>
                </TouchableOpacity>

              </View>
            ))
          )}
        </View>

        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>
            👥 Staff Quick Summary
          </Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>
              Total: <Text style={{fontWeight: 'bold'}}>{staff.length}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Present: <Text style={{fontWeight: 'bold'}}>{presentCount}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Absent: <Text style={{fontWeight: 'bold'}}>{absentCount}</Text>
            </Text>
          </View>
          <Text style={[globalStyles.footerStatText, { marginTop: 6, color: '#0D47A1', fontWeight: 'bold' }]}>
            Cloud Synced Data
          </Text>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}