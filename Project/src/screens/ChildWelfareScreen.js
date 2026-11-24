import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function ChildWelfareScreen({ navigation }) {
  // State to store all fetched children records from Firestore
  const [childrenList, setChildrenList] = useState([]);

  // States for live search input and dormitory filter selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDormFilter, setSelectedDormFilter] = useState('All');

  // States to control visibility of Dossier, Register, and Update modals, plus active child
  const [dossierModalVisible, setDossierModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // Form input states for registering a new child
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Boy');
  const [newDorm, setNewDorm] = useState('Cedar Dorm (Boys)');
  const [newBlood, setNewBlood] = useState('O+');
  const [newAllergies, setNewAllergies] = useState('None');
  const [newSchool, setNewSchool] = useState('Public School');

  // Form input states for updating an existing child's record
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGuardian, setEditGuardian] = useState('');
  const [editMedical, setEditMedical] = useState('');
  const [editSchool, setEditSchool] = useState('');

  // Fetch children records from Firebase Firestore when the screen first mounts
  useEffect(() => {
    const fetchCloudChildren = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "children"));
        const cloudData = querySnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setChildrenList(cloudData);
      } catch (error) {
        console.log("Firebase fetch error:", error.message);
      }
    };

    fetchCloudChildren();
  }, []);

  // Helper to show alerts seamlessly on both Web browser and Mobile devices
  const showCrossPlatformAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Strict sanitization: allow only letters, spaces, and dots for new child name
  const handleNameChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s.]/g, '');
    setNewName(cleaned);
  };

  // Strict sanitization: allow only digits for new child age
  const handleAgeChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNewAge(cleaned);
  };

  // Strict sanitization: allow only letters, spaces, and dots for edited name
  const handleEditNameChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s.]/g, '');
    setEditName(cleaned);
  };

  // Strict sanitization: allow only digits for edited age
  const handleEditAgeChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setEditAge(cleaned);
  };

  // Open the full child dossier modal for the selected child
  const handleOpenDossier = (child) => {
    setSelectedChild(child);
    setDossierModalVisible(true);
  };

  // Pre-fill edit form fields with existing child data and open the update modal
  const handleOpenUpdate = (child) => {
    setSelectedChild(child);
    setEditName(child.name || '');
    setEditAge(child.age || '');
    setEditGuardian(child.guardian || '');
    setEditMedical(child.medicalHistory || '');
    setEditSchool(child.school || '');
    setDossierModalVisible(false);
    setUpdateModalVisible(true);
  };

  // Validate form fields and create a new child document in Firebase Firestore
  const handleRegisterChild = async () => {
    if (!newName.trim() || !newAge.trim() || !newSchool.trim()) {
      showCrossPlatformAlert('Validation Error', 'Please fill in all required child fields properly.');
      return;
    }

    const ageNum = Number(newAge);
    if (ageNum < 0 || ageNum > 18) {
      showCrossPlatformAlert('Invalid Age', 'Please enter a valid age between 0 and 18.');
      return;
    }

    const newChild = {
      name: newName.trim(),
      details: `${newAge} yrs • ${newGender}\n${newDorm}`,
      caseNo: `CWC-2026-${Math.floor(100 + Math.random() * 900)}`,
      admissionDate: new Date().toISOString().split('T')[0],
      guardian: 'Admin / Social Worker',
      bloodGroup: newBlood.trim(),
      allergies: newAllergies.trim(),
      age: newAge.trim(),
      gender: newGender,
      dormitory: newDorm,
      medicalHistory: 'Initial checkup completed. Healthy.',
      vaccinations: 'Up to date as per schedule',
      school: newSchool.trim(),
      classGrade: 'Grade 1',
      attendance: '100% Attendance',
      extracurricular: 'Drawing, Sports'
    };

    try {
      // Save new record to Firestore 'children' collection
      const docRef = await addDoc(collection(db, "children"), newChild);
      const savedChild = { id: docRef.id, ...newChild };

      // Prepend newly registered child to local state and reset form
      setChildrenList([savedChild, ...childrenList]);
      setRegisterModalVisible(false);
      setNewName('');
      setNewAge('');
      showCrossPlatformAlert('Success', 'Child registered successfully to Cloud!');
    } catch (error) {
      showCrossPlatformAlert('Firebase Error', error.message);
    }
  };

  // Validate and update an existing child record in Firestore and local state
  const handleSaveUpdate = async () => {
    if (!editName.trim() || !editAge.trim()) {
      showCrossPlatformAlert('Validation Error', 'Name and Age cannot be empty.');
      return;
    }

    try {
      if (selectedChild && selectedChild.id) {
        await updateDoc(doc(db, "children", selectedChild.id), {
          name: editName.trim(),
          age: editAge.trim(),
          guardian: editGuardian.trim(),
          medicalHistory: editMedical.trim(),
          school: editSchool.trim()
        });
      }

      // Synchronize local state immediately using .map() without full reload
      const updatedList = childrenList.map((item) => {
        if (item.id === selectedChild.id) {
          return {
            ...item,
            name: editName.trim(),
            age: editAge.trim(),
            guardian: editGuardian.trim(),
            medicalHistory: editMedical.trim(),
            school: editSchool.trim(),
            details: `${editAge.trim()} yrs • ${item.gender}\n${item.dormitory}`,
          };
        }
        return item;
      });

      setChildrenList(updatedList);
      setUpdateModalVisible(false);
      showCrossPlatformAlert('Success', 'Child record updated successfully!');
    } catch (error) {
      showCrossPlatformAlert('Update Failed', error.message);
    }
  };

  // Delete a child record from Firebase Firestore across Web and Mobile after confirmation
  const handleDeleteChild = async (child) => {
    if (!child || !child.id) return;

    const executeDeletion = async () => {
      try {
        // Delete document from Firestore 'children' collection by document ID
        await deleteDoc(doc(db, "children", child.id));

        // Remove deleted child from local state and close dossier modal
        setChildrenList(previous => previous.filter(item => item.id !== child.id));
        setDossierModalVisible(false);
        setSelectedChild(null);
        showCrossPlatformAlert('Success', 'Child record deleted from Cloud.');
      } catch (error) {
        showCrossPlatformAlert('Delete Failed', error.message);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete ${child.name}'s record?`);
      if (confirmed) {
        await executeDeletion();
      }
    } else {
      Alert.alert(
        'Delete Child Record',
        `Are you sure you want to delete ${child.name}'s record?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: executeDeletion }
        ]
      );
    }
  };

  // Filter children dynamically by search text (name or case #) and selected dormitory
  const filteredChildren = childrenList.filter(child => {
    const matchesSearch = child.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          child.caseNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDorm = selectedDormFilter === 'All' || child.dormitory?.includes(selectedDormFilter);
    return matchesSearch && matchesDorm;
  });

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Back navigation button to return to Home */}
      <TouchableOpacity 
        onPress={() => navigation.replace('Home')} 
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>

      {/* Top screen header with logo, module title, and profile shortcut */}
      <View style={globalStyles.header}>
        <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
        <Text style={globalStyles.dashboardTitle}>Child Welfare</Text>
        <TouchableOpacity style={globalStyles.profileIconContainer} onPress={() => navigation.navigate('Profile')}>
          <Text style={globalStyles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}>
        
        {/* Section header and Register Child button */}
        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>Resident Children Records</Text>
          <TouchableOpacity 
            style={globalStyles.registerButton} 
            onPress={() => setRegisterModalVisible(true)}
          >
            <Text style={globalStyles.registerButtonText}>+ Register Child</Text>
          </TouchableOpacity>
        </View>

        {/* Search input and dormitory filter chips */}
        <View style={globalStyles.filterSection}>
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Search by name or case #..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={globalStyles.filterChipsRow}>
            {['All', 'Cedar', 'Willow'].map((dorm) => (
              <TouchableOpacity
                key={dorm}
                style={[
                  globalStyles.filterChip,
                  selectedDormFilter === dorm && globalStyles.filterChipActive
                ]}
                onPress={() => setSelectedDormFilter(dorm)}
              >
                <Text style={[
                  globalStyles.filterChipText,
                  selectedDormFilter === dorm && globalStyles.filterChipTextActive
                ]}>
                  {dorm === 'All' ? 'All Dorms' : `${dorm} Dorm`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scrollable list of filtered child cards */}
        <View style={globalStyles.mainCardContainerChild}>
          <ScrollView 
            style={globalStyles.innerScrollContainer} 
            contentContainerStyle={{ padding: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredChildren.length > 0 ? (
              filteredChildren.map((child) => (
                <View key={child.id} style={globalStyles.childCard}>
                  {/* Child avatar initial badge */}
                  <View style={globalStyles.avatarPlaceholder}>
                    <Text style={{ fontWeight: 'bold', color: '#0D47A1', fontSize: 16 }}>
                      {child.name ? child.name[0].toUpperCase() : 'C'}
                    </Text>
                  </View>
                  
                  {/* Child summary details */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={globalStyles.childNameText}>{child.name}</Text>
                    <Text style={globalStyles.childDetailsText}>{child.details}</Text>
                    <Text style={globalStyles.caseText}>Case: {child.caseNo}</Text>
                  </View>

                  {/* Button to open complete child dossier modal */}
                  <TouchableOpacity 
                    style={globalStyles.viewDossierBtn} 
                    onPress={() => handleOpenDossier(child)}
                  >
                    <Text style={globalStyles.viewDossierText}>View Dossier →</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={globalStyles.noRecordText}>No children found in Cloud database.</Text>
            )}
          </ScrollView>
        </View>

        {/* Footer summary displaying total resident count and cloud sync status */}
        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>📊 Shelter Quick Summary</Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>Total Resident: <Text style={{fontWeight: 'bold'}}>{childrenList.length}</Text></Text>
            <Text style={globalStyles.footerStatText}><Text style={{color: '#0D47A1', fontWeight: 'bold'}}>Cloud Synced Database</Text></Text>
          </View>
        </View>

        {/* 1. VIEW DOSSIER MODAL (General Info, Medical, Education, Update & Delete) */}
        {selectedChild && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={dossierModalVisible}
            onRequestClose={() => setDossierModalVisible(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContentLarge}>
                {/* Modal header and close icon */}
                <View style={globalStyles.modalHeaderRow}>
                  <Text style={globalStyles.modalTitle}>Complete Child Dossier</Text>
                  <TouchableOpacity onPress={() => setDossierModalVisible(false)}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Dossier profile banner */}
                  <View style={globalStyles.modalProfileRow}>
                    <View style={globalStyles.avatarPlaceholderLarge}>
                      <Text style={{ fontWeight: 'bold', color: '#0D47A1', fontSize: 18 }}>
                        {selectedChild.name ? selectedChild.name[0] : 'C'}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={globalStyles.modalChildName}>{selectedChild.name}</Text>
                      <Text style={globalStyles.modalChildSub}>{selectedChild.details}</Text>
                    </View>
                  </View>

                  {/* General case and admission information */}
                  <View style={globalStyles.modalDataBox}>
                    <Text style={globalStyles.sectionHeaderSmall}>📋 General Information</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Case File #:</Text> {selectedChild.caseNo}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Admission Date:</Text> {selectedChild.admissionDate}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Guardian/Officer:</Text> {selectedChild.guardian}</Text>
                  </View>

                  {/* Medical and vaccination information */}
                  <View style={[globalStyles.modalDataBox, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
                    <Text style={[globalStyles.sectionHeaderSmall, { color: '#2E7D32' }]}>🩺 Medical & Vaccination Tracker</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Blood Group:</Text> {selectedChild.bloodGroup}</Text>
                    <Text style={globalStyles.dataRow}><Text style={[globalStyles.dataLabel, { color: '#D32F2F' }]}>Allergies:</Text> {selectedChild.allergies}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Medical History:</Text> {selectedChild.medicalHistory}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Vaccinations:</Text> {selectedChild.vaccinations}</Text>
                  </View>

                  {/* Education and academic details */}
                  <View style={[globalStyles.modalDataBox, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]}>
                    <Text style={[globalStyles.sectionHeaderSmall, { color: '#0D47A1' }]}>📚 Education & Academic Progress</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>School:</Text> {selectedChild.school}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Class/Grade:</Text> {selectedChild.classGrade}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Attendance:</Text> {selectedChild.attendance}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Extracurriculars:</Text> {selectedChild.extracurricular}</Text>
                  </View>
                </ScrollView>

                {/* Action button to open Update Record modal */}
                <TouchableOpacity 
                  style={globalStyles.updateButton} 
                  onPress={() => handleOpenUpdate(selectedChild)}
                >
                  <Text style={globalStyles.updateButtonText}>Update Record</Text>
                </TouchableOpacity>

                {/* Action button to delete the selected child's record */}
                <TouchableOpacity 
                  style={[globalStyles.closeModalButton, { backgroundColor: '#C62828', marginBottom: 8 }]} 
                  onPress={() => handleDeleteChild(selectedChild)}
                >
                  <Text style={[globalStyles.closeModalButtonText, { color: '#FFFFFF' }]}>Delete Record</Text>
                </TouchableOpacity>

                {/* Action button to close the dossier modal */}
                <TouchableOpacity 
                  style={globalStyles.closeModalButton} 
                  onPress={() => setDossierModalVisible(false)}
                >
                  <Text style={globalStyles.closeModalButtonText}>Close Dossier</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* 2. REGISTER CHILD MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={registerModalVisible}
          onRequestClose={() => setRegisterModalVisible(false)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              {/* Register modal header */}
              <View style={globalStyles.modalHeaderRow}>
                <Text style={globalStyles.modalTitle}>Register Child in Shelter</Text>
                <TouchableOpacity onPress={() => setRegisterModalVisible(false)}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Child full name input */}
                <Text style={globalStyles.inputLabel}>Child Full Name (Letters Only) *</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. Ali" 
                  placeholderTextColor="#888"
                  value={newName}
                  onChangeText={handleNameChange}
                />

                {/* Child age input */}
                <Text style={globalStyles.inputLabel}>Age (Numbers Only) *</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. 8" 
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  maxLength={2}
                  value={newAge}
                  onChangeText={handleAgeChange}
                />

                {/* Gender selection chips (syncs default dorm) */}
                <Text style={globalStyles.inputLabel}>Gender *</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                  <TouchableOpacity 
                    style={[globalStyles.modalChip, newGender === 'Boy' && globalStyles.modalChipActive]}
                    onPress={() => {
                      setNewGender('Boy');
                      setNewDorm('Cedar Dorm (Boys)');
                    }}
                  >
                    <Text style={[globalStyles.modalChipText, newGender === 'Boy' && globalStyles.modalChipTextActive]}>Boy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[globalStyles.modalChip, newGender === 'Girl' && globalStyles.modalChipActive]}
                    onPress={() => {
                      setNewGender('Girl');
                      setNewDorm('Willow Dorm (Girls)');
                    }}
                  >
                    <Text style={[globalStyles.modalChipText, newGender === 'Girl' && globalStyles.modalChipTextActive]}>Girl</Text>
                  </TouchableOpacity>
                </View>

                {/* Dormitory selection chips (syncs gender) */}
                <Text style={globalStyles.inputLabel}>Dormitory *</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                  <TouchableOpacity 
                    style={[globalStyles.modalChip, newDorm === 'Cedar Dorm (Boys)' && globalStyles.modalChipActive]}
                    onPress={() => {
                      setNewDorm('Cedar Dorm (Boys)');
                      setNewGender('Boy');
                    }}
                  >
                    <Text style={[globalStyles.modalChipText, newDorm === 'Cedar Dorm (Boys)' && globalStyles.modalChipTextActive]}>Cedar Dorm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[globalStyles.modalChip, newDorm === 'Willow Dorm (Girls)' && globalStyles.modalChipActive]}
                    onPress={() => {
                      setNewDorm('Willow Dorm (Girls)');
                      setNewGender('Girl');
                    }}
                  >
                    <Text style={[globalStyles.modalChipText, newDorm === 'Willow Dorm (Girls)' && globalStyles.modalChipTextActive]}>Willow Dorm</Text>
                  </TouchableOpacity>
                </View>

                {/* School name input */}
                <Text style={globalStyles.inputLabel}>School Name</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. City Public School" 
                  placeholderTextColor="#888"
                  value={newSchool}
                  onChangeText={setNewSchool}
                />

                {/* Blood group input */}
                <Text style={globalStyles.inputLabel}>Blood Group</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. O+" 
                  placeholderTextColor="#888"
                  value={newBlood}
                  onChangeText={setNewBlood}
                />

                {/* Submit button to save new child record */}
                <TouchableOpacity 
                  style={globalStyles.saveButton} 
                  onPress={handleRegisterChild}
                >
                  <Text style={globalStyles.saveButtonText}>Save Child Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 3. UPDATE RECORD MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateModalVisible}
          onRequestClose={() => setUpdateModalVisible(false)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              {/* Update modal header */}
              <View style={globalStyles.modalHeaderRow}>
                <Text style={globalStyles.modalTitle}>Update Child Record</Text>
                <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Editable child name input */}
                <Text style={globalStyles.inputLabel}>Child Name (Letters Only)</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  value={editName}
                  onChangeText={handleEditNameChange}
                />

                {/* Editable child age input */}
                <Text style={globalStyles.inputLabel}>Age (Numbers Only)</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  keyboardType="numeric"    
                  maxLength={2}
                  value={editAge}
                  onChangeText={handleEditAgeChange}
                />

                {/* Editable guardian/officer input */}
                <Text style={globalStyles.inputLabel}>Guardian/Officer</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  value={editGuardian}
                  onChangeText={setEditGuardian}
                />

                {/* Editable medical history input */}
                <Text style={globalStyles.inputLabel}>Medical History / Notes</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  value={editMedical}
                  onChangeText={setEditMedical}
                />

                {/* Editable school name input */}
                <Text style={globalStyles.inputLabel}>School Name</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  value={editSchool}
                  onChangeText={setEditSchool}
                />

                {/* Save changes button */}
                <TouchableOpacity 
                  style={globalStyles.saveButton} 
                  onPress={handleSaveUpdate}
                >
                  <Text style={globalStyles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}