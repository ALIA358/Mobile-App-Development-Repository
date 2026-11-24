import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '../reportTemplate';

export default function HistoryDashboard({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const [totalChildren, setTotalChildren] = useState(0);
  const [boysCount, setBoysCount] = useState(0);
  const [girlsCount, setGirlsCount] = useState(0);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [admissionsModalVisible, setAdmissionsModalVisible] = useState(false);
  const [medicalModalVisible, setMedicalModalVisible] = useState(false);

  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const childrenSnapshot = await getDocs(collection(db, "children"));
        const childrenData = childrenSnapshot.docs.map(doc => doc.data());

        if (childrenData.length > 0) {
          setTotalChildren(childrenData.length);
          const boys = childrenData.filter(c => c.gender?.toLowerCase() === 'boy' || c.dormitory?.includes('Boys')).length;
          const girls = childrenData.filter(c => c.gender?.toLowerCase() === 'girl' || c.dormitory?.includes('Girls')).length;
          setBoysCount(boys);
          setGirlsCount(girls);
        } else {
          setTotalChildren(0);
          setBoysCount(0);
          setGirlsCount(0);
        }

        const expensesSnapshot = await getDocs(collection(db, "expenses"));
        const expensesData = expensesSnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));

        setExpenses(expensesData);

      } catch (error) {
        console.log("Cloud fetch error:", error.message);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchCloudData();
  }, []);

  // Strict Sanitization Handlers
  const handleExpenseTitleChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s&.-]/g, '');
    setNewExpenseTitle(cleaned);
  };

  const handleExpenseAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNewExpenseAmount(cleaned);
  };

  const handleAddExpense = async () => {
    if (!newExpenseTitle.trim() || !newExpenseAmount.trim()) {
      Alert.alert('Error', 'Please enter expense title and amount properly.');
      return;
    }

    const newExpense = {
      title: newExpenseTitle.trim(),
      amount: newExpenseAmount.trim(),
      date: new Date().toISOString().split('T')[0],
      category: 'General',
    };

    try {
      const docRef = await addDoc(collection(db, "expenses"), newExpense);
      const savedExpense = { id: docRef.id, ...newExpense };

      setExpenses([savedExpense, ...expenses]);
      setNewExpenseTitle('');
      setNewExpenseAmount('');
      Alert.alert('Success', 'Expense recorded to Cloud!');
    } catch (error) {
      Alert.alert('Firebase Error: ' + error.message);
    }
  };

  const downloadReport = async () => {
    try {
      const html = generateReportHTML(totalChildren, boysCount, girlsCount, expenses);

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          alert('Please allow pop-ups to print/save the report.');
        }
        return;
      }

      const file = await Print.printToFileAsync({
        html: html,
        base64: false
      });

      if (file && file.uri) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Orphanage Financial Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        alert('Could not generate PDF file.');
      }

    } catch (error) {
      console.log('PDF ERROR:', error);
      alert('PDF Generation failed: ' + error.message);
    }
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

      <View style={globalStyles.header}>
        <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
        <Text style={globalStyles.dashboardTitle}>Reports & History</Text>
        <TouchableOpacity
          style={globalStyles.profileIconContainer}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={globalStyles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>Yearly Analytics & Logs</Text>
          <TouchableOpacity style={globalStyles.registerButton} onPress={downloadReport}>
            <Text style={globalStyles.registerButtonText}>📥 Download Report</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TouchableOpacity 
            style={[globalStyles.modalDataBox, { flex: 1, backgroundColor: '#E3F2FD' }]}
            activeOpacity={0.7}
            onPress={() => setAdmissionsModalVisible(true)}
          >
            <Text style={[globalStyles.sectionHeaderSmall, { color: '#0D47A1' }]}>
              📊 Yearly Admissions ↗
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0D47A1', marginTop: 4 }}>
              {loadingAnalytics ? 'Loading...' : `${totalChildren} Children`}
            </Text>
            <Text style={{ fontSize: 11, color: '#555' }}>
              {boysCount} Boys • {girlsCount} Girls (Tap for Graph)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.modalDataBox, { flex: 1, backgroundColor: '#E8F5E9' }]}
            activeOpacity={0.7}
            onPress={() => setMedicalModalVisible(true)}
          >
            <Text style={[globalStyles.sectionHeaderSmall, { color: '#2E7D32' }]}>
              🩺 Medical Trends ↗
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginTop: 4 }}>
              Asthma & Flu (Past Year)
            </Text>
            <Text style={{ fontSize: 11, color: '#555' }}>
              Tap for detailed history
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[globalStyles.mainCardContainerChild, { height: 340, padding: 10 }]}>
          <ScrollView
            style={globalStyles.innerScrollContainer}
            contentContainerStyle={{ padding: 4 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[globalStyles.sectionTitle, { marginBottom: 8 }]}>
              💰 Daily Expenses Tracking
            </Text>

            <View style={{
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              elevation: 2,
            }}>
              <Text style={globalStyles.inputLabel}>Expense Title (Letters Only) *</Text>
              <TextInput
                style={globalStyles.textInput}
                placeholder="e.g. Stationery & Books"
                placeholderTextColor="#888"
                value={newExpenseTitle}
                onChangeText={handleExpenseTitleChange}
              />

              <Text style={globalStyles.inputLabel}>Amount (Numbers Only, PKR) *</Text>
              <TextInput
                style={globalStyles.textInput}
                placeholder="e.g. 5000"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={newExpenseAmount}
                onChangeText={handleExpenseAmountChange}
              />

              <TouchableOpacity
                style={[globalStyles.saveButton, { marginTop: 10, marginBottom: 0 }]}
                onPress={handleAddExpense}
              >
                <Text style={globalStyles.saveButtonText}>+ Record Expense</Text>
              </TouchableOpacity>
            </View>

            <Text style={[globalStyles.sectionHeaderSmall, { marginBottom: 8 }]}>
              📋 Expense Records
            </Text>

            {expenses.length > 0 ? (
              expenses.map((item) => (
                <View key={item.id} style={globalStyles.childCard}>
                  <View style={[globalStyles.avatarPlaceholder, { backgroundColor: '#FCE4EC', borderColor: '#F8BBD0' }]}>
                    <Text style={{ fontWeight: 'bold', color: '#C2185B', fontSize: 16 }}>₨</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={globalStyles.childNameText}>{item.title}</Text>
                    <Text style={globalStyles.childDetailsText}>Date: {item.date}</Text>
                    <Text style={globalStyles.caseText}>Category: {item.category}</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#D32F2F', fontSize: 13 }}>
                    -{item.amount} PKR
                  </Text>
                </View>
              ))
            ) : (
              <Text style={globalStyles.noRecordText}>No expense records found in Cloud.</Text>
            )}
          </ScrollView>
        </View>

        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>📊 Financial & Analytics Summary</Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>
              Total Records: <Text style={{ fontWeight: 'bold' }}>{expenses.length}</Text>
            </Text>
            <Text style={globalStyles.footerStatText}>
              <Text style={{ color: '#0D47A1', fontWeight: 'bold' }}>Cloud Synced Data</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ADMISSIONS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={admissionsModalVisible}
        onRequestClose={() => setAdmissionsModalVisible(false)}
      >
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContentLarge}>
            <View style={globalStyles.modalHeaderRow}>
              <Text style={globalStyles.modalTitle}>📊 Yearly Admissions Analytics</Text>
              <TouchableOpacity onPress={() => setAdmissionsModalVisible(false)}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[globalStyles.modalDataBox, { backgroundColor: '#E3F2FD' }]}>
                <Text style={globalStyles.sectionHeaderSmall}>Overview (Live Cloud Data)</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Total Residents:</Text> {totalChildren}</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Boys Dormitory:</Text> {boysCount} Children</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Girls Dormitory:</Text> {girlsCount} Children</Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={globalStyles.closeModalButton} 
              onPress={() => setAdmissionsModalVisible(false)}
            >
              <Text style={globalStyles.closeModalButtonText}>Close Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MEDICAL MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={medicalModalVisible}
        onRequestClose={() => setMedicalModalVisible(false)}
      >
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContentLarge}>
            <View style={globalStyles.modalHeaderRow}>
              <Text style={globalStyles.modalTitle}>🩺 Historical Medical Trends</Text>
              <TouchableOpacity onPress={() => setMedicalModalVisible(false)}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[globalStyles.modalDataBox, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[globalStyles.sectionHeaderSmall, { color: '#2E7D32' }]}>Primary Health Logs (Past Year)</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>1. Asthma / Dust Allergy:</Text> 35% of cases</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>2. Seasonal Flu & Cough:</Text> 45% of cases</Text>
                <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>3. Routine Checkups / Vision:</Text> 20%</Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={globalStyles.closeModalButton} 
              onPress={() => setMedicalModalVisible(false)}
            >
              <Text style={globalStyles.closeModalButtonText}>Close Medical History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}