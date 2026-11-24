import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function DonationManagement({ navigation }) {
  // State to store fetched donation records from Firestore
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for registration form inputs
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState('');

  // States for search, category filtering, form visibility, and expanded card details
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Available donation category filters
  const filters = ['All', 'Cash', 'Food', 'Clothing', 'Medical'];

  // Helper function to display alerts seamlessly across both Web and Mobile platforms
  const showCrossPlatformAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Fetch all donation records from Firebase Firestore when the screen mounts
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "donations"));
        const data = querySnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setDonations(data);
      } catch (error) {
        console.log("Cloud fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Input Sanitization: Allow only letters, spaces, and dots for donor name
  const handleDonorNameChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s.]/g, '');
    setDonorName(cleaned);
  };

  // Input Sanitization: Allow only numeric digits for donation amount
  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  // Input Sanitization: Allow only letters and spaces for donation type
  const handleDonationTypeChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setDonationType(cleaned);
  };

  // Validate inputs and add a new donation record to Firebase Firestore
  const addDonation = async () => {
    if (!donorName.trim() || !amount.trim() || !donationType.trim()) {
      showCrossPlatformAlert('Error', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      showCrossPlatformAlert('Error', 'Please enter a valid amount.');
      return;
    }

    const newDonation = {
      donorName: donorName.trim(),
      amount: amount.trim(),
      donationType: donationType.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // Save document to Firestore 'donations' collection
      const docRef = await addDoc(collection(db, "donations"), newDonation);
      const savedDonation = { id: docRef.id, ...newDonation };

      // Update local state immediately so UI reflects the new record
      setDonations(previous => [...previous, savedDonation]);
      setDonorName('');
      setAmount('');
      setDonationType('');
      setShowForm(false);

      showCrossPlatformAlert('Success', 'Donation added to Cloud successfully!');
    } catch (error) {
      showCrossPlatformAlert('Firebase Error', error.message);
    }
  };

  // Delete a donation record permanently from Firebase Firestore (Web & Mobile compatible)
  const deleteDonation = async (id) => {
    // Core deletion logic executed after user confirmation
    const executeDeletion = async () => {
      try {
        // Delete document from Firestore using its unique document ID
        await deleteDoc(doc(db, "donations", id));

        // Remove deleted item from local state to update the UI immediately
        setDonations(previous => previous.filter(item => item.id !== id));
        setSelectedDonation(null);

        showCrossPlatformAlert('Success', 'Donation record deleted from Cloud.');
      } catch (error) {
        console.error("Delete Error:", error);
        showCrossPlatformAlert('Error', 'Failed to delete record: ' + error.message);
      }
    };

    // Handle confirmation dialog separately for Web browser vs. Mobile native alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this record?');
      if (confirmed) {
        await executeDeletion();
      }
    } else {
      Alert.alert(
        'Delete Donation',
        'Are you sure you want to delete this record?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDeletion
          }
        ]
      );
    }
  };

  // Filter donations dynamically based on search query and selected category chip
  const filteredDonations = donations.filter(item => {
    const matchesSearch =
      item.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.donationType?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      item.donationType?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Calculate total monetary donation amount across all records
  const totalAmount = donations.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  return (
    <SafeAreaView style={globalStyles.container}>

      {/* Navigation Back Arrow */}
      <TouchableOpacity
        onPress={() => navigation.replace('Home')}
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>

      {/* Screen Header with App Logo, Title, and Profile Shortcut */}
      <View style={globalStyles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={globalStyles.logoIcon}
        />
        <Text style={globalStyles.dashboardTitle}>
          Donations 💝
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

        {/* Top Action Bar with Section Title and Toggle Form Button */}
        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>
            Donation Records
          </Text>

          <TouchableOpacity
            style={globalStyles.registerButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={globalStyles.registerButtonText}>
              {showForm ? '− Close' : '+ Add Donation'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Add Donation Form */}
        {showForm && (
          <View style={globalStyles.formCard}>
            <Text style={globalStyles.sectionHeaderSmall}>
              Register New Donation
            </Text>

            <Text style={globalStyles.inputLabel}>Donor Name (Letters Only) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter donor name"
              placeholderTextColor="#888"
              value={donorName}
              onChangeText={handleDonorNameChange}
            />

            <Text style={globalStyles.inputLabel}>Amount (Numbers Only, Rs.) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Enter donation amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
            />

            <Text style={globalStyles.inputLabel}>Donation Type (Letters Only) *</Text>
            <TextInput
              style={globalStyles.textInput}
              placeholder="Cash, Food, Clothing, Medical"
              placeholderTextColor="#888"
              value={donationType}
              onChangeText={handleDonationTypeChange}
            />

            <TouchableOpacity
              style={globalStyles.saveButton}
              onPress={addDonation}
            >
              <Text style={globalStyles.saveButtonText}>
                Save Donation
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Input Box */}
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Search by donor name or donation type..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        {/* Horizontal Category Filter Chips */}
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

        {/* Main Donation History List Container */}
        <View style={globalStyles.mainCardContainer}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 12 }]}>
            Donation History
          </Text>

          {loading ? (
            <Text style={globalStyles.noRecordText}>Loading cloud records...</Text>
          ) : filteredDonations.length === 0 ? (
            <Text style={globalStyles.noRecordText}>
              No donation records found in Cloud.
            </Text>
          ) : (
            filteredDonations.map(item => (
              <View
                key={item.id}
                style={globalStyles.childCard}
              >
                {/* Donor Initial Avatar */}
                <View style={globalStyles.avatarPlaceholder}>
                  <Text style={globalStyles.childNameText}>
                    {item.donorName ? item.donorName.charAt(0).toUpperCase() : 'D'}
                  </Text>
                </View>

                {/* Donation Summary & Expandable Details */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={globalStyles.childNameText}>
                    {item.donorName}
                  </Text>
                  <Text style={globalStyles.childDetailsText}>
                    Amount: Rs. {item.amount}
                  </Text>
                  <Text style={globalStyles.caseText}>
                    Category: {item.donationType} | Date: {item.date}
                  </Text>

                  {/* Expanded Detail Box with Delete Button */}
                  {selectedDonation === item.id && (
                    <View style={[globalStyles.modalDataBox, { marginTop: 8 }]}>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Donor:</Text> {item.donorName}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Amount:</Text> Rs. {item.amount}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Donation Type:</Text> {item.donationType}
                      </Text>
                      <Text style={globalStyles.dataRow}>
                        <Text style={globalStyles.dataLabel}>Date:</Text> {item.date}
                      </Text>

                      <TouchableOpacity
                        style={[globalStyles.closeModalButton, { backgroundColor: '#C62828', marginTop: 8 }]}
                        onPress={() => deleteDonation(item.id)}
                      >
                        <Text style={globalStyles.closeModalButtonText}>
                          Delete Record
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Expand / Collapse Details Button */}
                <TouchableOpacity
                  style={globalStyles.viewDossierBtn}
                  onPress={() =>
                    setSelectedDonation(
                      selectedDonation === item.id ? null : item.id
                    )
                  }
                >
                  <Text style={globalStyles.viewDossierText}>
                    {selectedDonation === item.id ? 'Hide' : 'Details →'}
                  </Text>
                </TouchableOpacity>

              </View>
            ))
          )}
        </View>

        {/* Bottom Summary Statistics Card */}
        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>
            💝 Donation Quick Summary
          </Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>
              Total Donations: <Text style={{ fontWeight: 'bold' }}>{donations.length}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              Total Amount: <Text style={{ fontWeight: 'bold' }}>Rs. {totalAmount}</Text>
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