import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function AdoptionScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [orphanageChildren, setOrphanageChildren] = useState([]); // Orphanage ke registered bachon ka record
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [newApplicant, setNewApplicant] = useState('');
  const [newChild, setNewChild] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDocs, setNewDocs] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  // Fetch Cloud Data (Adoptions + Registered Children) on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Adoption Applications
        const adoptionsSnapshot = await getDocs(collection(db, "adoptions"));
        const adoptionsData = adoptionsSnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setApplications(adoptionsData);

        // 2. Fetch Registered Orphanage Children (Verification ke liye)
        const childrenSnapshot = await getDocs(collection(db, "children"));
        const childrenData = childrenSnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setOrphanageChildren(childrenData);

      } catch (error) {
        console.log("Cloud fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Input Sanitization Handlers
  const handleApplicantChange = (text) => {
    // Sirf alphabets aur spaces allow hain (numbers aur special chars block)
    const cleaned = text.replace(/[^a-zA-Z\s.]/g, '');
    setNewApplicant(cleaned);
  };

  const handleChildNameChange = (text) => {
    // Sirf alphabets aur spaces allow hain
    const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setNewChild(cleaned);
  };

  const handleAgeChange = (text) => {
    // Sirf numbers allow hain (text block)
    const cleaned = text.replace(/[^0-9]/g, '');
    setNewChildAge(cleaned);
  };

  const handleContactChange = (text) => {
    // Sirf numbers aur '+' allow hain
    const cleaned = text.replace(/[^0-9+]/g, '');
    setNewContact(cleaned);
  };

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setModalVisible(true);
  };

  // Update Status in Firebase Firestore
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApp) return;

    try {
      const docRef = doc(db, "adoptions", selectedApp.id);
      await updateDoc(docRef, { status: newStatus });

      const updated = applications.map((item) => {
        if (item.id === selectedApp.id) {
          return { ...item, status: newStatus };
        }
        return item;
      });

      setApplications(updated);
      setSelectedApp({ ...selectedApp, status: newStatus });
      setModalVisible(false);

      Alert.alert('Success', `Case status updated to: ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status: ' + error.message);
    }
  };

  // Add New Application with Orphanage Child Verification
  const handleAddApplication = async () => {
    if (
      !newApplicant.trim() ||
      !newChild.trim() ||
      !newChildAge.trim() ||
      !newContact.trim() ||
      !newDate.trim() ||
      !newDocs.trim()
    ) {
      Alert.alert('Validation Error', 'Please fill in all application fields properly.');
      return;
    }

    // Age range check
    const ageNum = Number(newChildAge);
    if (ageNum < 0 || ageNum > 18) {
      Alert.alert('Invalid Age', 'Please enter a valid child age between 0 and 18.');
      return;
    }

    // CHECK: Kya yeh bacha orphanage ke records ("children" collection) mein maujood hai?
    const childExists = orphanageChildren.some(
      (child) => child.name?.trim().toLowerCase() === newChild.trim().toLowerCase()
    );

    if (!childExists) {
      Alert.alert(
        'Child Not Found ❌',
        `"${newChild.trim()}" is not registered in the Orphanage Children records. Only children currently residing in the orphanage can be requested for adoption.`
      );
      return;
    }

    const newApplication = {
      applicantName: newApplicant.trim(),
      childName: newChild.trim(),
      childAge: newChildAge.trim(),
      contact: newContact.trim(),
      submissionDate: newDate.trim(),
      legalDocs: newDocs.trim(),
      status: 'Under Review',
    };

    try {
      const docRef = await addDoc(collection(db, "adoptions"), newApplication);
      const savedApplication = { id: docRef.id, ...newApplication };

      setApplications(previous => [...previous, savedApplication]);

      setNewApplicant('');
      setNewChild('');
      setNewChildAge('');
      setNewContact('');
      setNewDate('');
      setNewDocs('');
      setShowForm(false);

      Alert.alert('Success', 'Verified & added new adoption application to Cloud!');
    } catch (error) {
      Alert.alert('Firebase Error: ' + error.message);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      app.childName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' || app.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalApplications = applications.length;
  const underReview = applications.filter(app => app.status === 'Under Review').length;
  const approved = applications.filter(app => app.status === 'Approved').length;
  const rejected = applications.filter(app => app.status === 'Rejected').length;

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
            Adoption & Cases 📝
          </Text>
          <TouchableOpacity
            style={globalStyles.profileIconContainer}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={globalStyles.profileEmoji}>👤</Text>
          </TouchableOpacity>
        </View>
      

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Add Application Button Bar */}
        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>Applications Management</Text>
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={globalStyles.registerButton}
          >
            <Text style={globalStyles.registerButtonText}>
              {showForm ? '✕ Close Form' : '+ Add Application'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Application Form */}
        {showForm && (
          <View style={globalStyles.formCard}>
            <Text style={globalStyles.sectionHeaderSmall}>
              Register New Adoption Application
            </Text>

            <Text style={globalStyles.inputLabel}>Applicant Name (Letters Only) *</Text>
            <TextInput
              placeholder="e.g. Tariq Mahmood"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              value={newApplicant}
              onChangeText={handleApplicantChange}
            />

            <Text style={globalStyles.inputLabel}>Orphanage Child Name (Must be registered) *</Text>
            <TextInput
              placeholder="Enter exact registered child name"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              value={newChild}
              onChangeText={handleChildNameChange}
            />

            <Text style={globalStyles.inputLabel}>Child Age (Numbers Only) *</Text>
            <TextInput
              placeholder="e.g. 5"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              keyboardType="numeric"
              maxLength={2}
              value={newChildAge}
              onChangeText={handleAgeChange}
            />

            <Text style={globalStyles.inputLabel}>Contact Number (Digits Only) *</Text>
            <TextInput
              placeholder="e.g. 03001234567"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              keyboardType="phone-pad"
              maxLength={13}
              value={newContact}
              onChangeText={handleContactChange}
            />

            <Text style={globalStyles.inputLabel}>Submission Date (YYYY-MM-DD) *</Text>
            <TextInput
              placeholder="e.g. 2026-11-13"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              value={newDate}
              onChangeText={setNewDate}
            />

            <Text style={globalStyles.inputLabel}>Legal Documents Information *</Text>
            <TextInput
              placeholder="Enter verified documents details"
              placeholderTextColor="#888"
              style={globalStyles.textInput}
              multiline
              value={newDocs}
              onChangeText={setNewDocs}
            />

            <TouchableOpacity
              style={globalStyles.saveButton}
              onPress={handleAddApplication}
            >
              <Text style={globalStyles.saveButtonText}>
                Verify & Save Application
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <TextInput
          placeholder="Search by applicant or child name..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={globalStyles.searchInput}
        />

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[globalStyles.filterChipsRow, { marginBottom: 12 }]}
        >
          {['All', 'Under Review', 'Approved', 'Rejected'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                globalStyles.filterChip,
                filter === item && globalStyles.filterChipActive
              ]}
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

        {/* Applications List Container */}
        <View style={globalStyles.mainCardContainer}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 12 }]}>
            Adoption Application Records
          </Text>

          {loading ? (
            <Text style={globalStyles.noRecordText}>Loading cloud records...</Text>
          ) : filteredApplications.length === 0 ? (
            <Text style={globalStyles.noRecordText}>
              No adoption applications found in Cloud.
            </Text>
          ) : (
            filteredApplications.map((app) => (
              <View
                key={app.id}
                style={globalStyles.childCard}
              >
                <View style={globalStyles.avatarPlaceholder}>
                  <Text style={globalStyles.childNameText}>
                    {app.applicantName ? app.applicantName.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={globalStyles.childNameText}>
                    {app.applicantName}
                  </Text>
                  <Text style={globalStyles.childDetailsText}>
                    Target Child: {app.childName} {app.childAge ? `(${app.childAge} yrs)` : ''}
                  </Text>
                  <Text style={globalStyles.caseText}>
                    Status: {app.status}
                  </Text>
                  <Text style={globalStyles.childDetailsText}>
                    Date: {app.submissionDate}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenDetails(app)}
                  style={globalStyles.viewDossierBtn}
                >
                  <Text style={globalStyles.viewDossierText}>
                    Details →
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Adoption Quick Summary */}
        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>
            📝 Adoption Quick Summary
          </Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>
              Total: <Text style={{fontWeight: 'bold'}}>{totalApplications}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Review: <Text style={{fontWeight: 'bold'}}>{underReview}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Approved: <Text style={{fontWeight: 'bold'}}>{approved}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Rejected: <Text style={{fontWeight: 'bold'}}>{rejected}</Text>
            </Text>
          </View>
          <Text style={[globalStyles.footerStatText, { marginTop: 6, color: '#0D47A1', fontWeight: 'bold' }]}>
            Cloud Synced Data • Orphanage Verified
          </Text>
        </View>

        {/* Case Review Modal */}
        {selectedApp && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContentLarge}>
                <View style={globalStyles.modalHeaderRow}>
                  <Text style={globalStyles.modalTitle}>
                    Case Review & Legal Docs
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={globalStyles.modalDataBox}>
                    <Text style={globalStyles.sectionHeaderSmall}>
                      👤 Applicant Details
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      <Text style={globalStyles.dataLabel}>Applicant:</Text> {selectedApp.applicantName}
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      <Text style={globalStyles.dataLabel}>Contact:</Text> {selectedApp.contact}
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      <Text style={globalStyles.dataLabel}>Submission Date:</Text> {selectedApp.submissionDate}
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      <Text style={globalStyles.dataLabel}>Child:</Text> {selectedApp.childName} {selectedApp.childAge ? `(${selectedApp.childAge} yrs)` : ''}
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      <Text style={globalStyles.dataLabel}>Status:</Text> {selectedApp.status}
                    </Text>
                  </View>

                  <View style={globalStyles.modalDataBox}>
                    <Text style={globalStyles.sectionHeaderSmall}>
                      ⚖️ Legal Documentation
                    </Text>
                    <Text style={globalStyles.dataRow}>
                      {selectedApp.legalDocs}
                    </Text>
                  </View>
                </ScrollView>

                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={[globalStyles.updateButton, { backgroundColor: '#2E7D32' }]}
                    onPress={() => handleUpdateStatus('Approved')}
                  >
                    <Text style={globalStyles.updateButtonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.updateButton, { backgroundColor: '#C62828' }]}
                    onPress={() => handleUpdateStatus('Rejected')}
                  >
                    <Text style={globalStyles.updateButtonText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.updateButton, { backgroundColor: '#1E88E5' }]}
                    onPress={() => handleUpdateStatus('Under Review')}
                  >
                    <Text style={globalStyles.updateButtonText}>Return to Review</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[globalStyles.closeModalButton, { marginTop: 8 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={globalStyles.closeModalButtonText}>Close Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}