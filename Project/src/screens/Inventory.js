import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function InventoryScreen({ navigation }) {
  // State to store all fetched inventory records from Firestore and loading status
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for live search query and category filter chips
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // States to control visibility of Item Details, Add Supply, and Update Stock modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form input states for adding a new supply item
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newQuantity, setNewQuantity] = useState('');
  const [newLocation, setNewLocation] = useState('Main Warehouse');

  // Form input states for updating stock quantity and status
  const [editQuantity, setEditQuantity] = useState('');
  const [editStatus, setEditStatus] = useState('');


  // Fetch inventory items from Firebase Firestore when the screen mounts
  useEffect(() => {
    const fetchCloudInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        const cloudData = querySnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setInventoryList(cloudData);
      } catch (error) {
        console.log("Firebase inventory fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCloudInventory();
  }, []);

  // Helper function to display alerts smoothly on both Web browser and Mobile devices
  const showCrossPlatformAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Strict input sanitization: allow only letters, numbers, spaces, dots, and hyphens for item name
  const handleItemNameChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z0-9\s.-]/g, '');
    setNewItemName(cleaned);
  };

  // Strict input sanitization: allow only alphanumeric characters and spaces for quantity/units
  const handleQuantityChange = (text) => {
    const cleaned = text.replace(/[^0-9a-zA-Z\s]/g, '');
    setNewQuantity(cleaned);
  };

  // Strict input sanitization: allow only safe location characters
  const handleLocationChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z0-9\s.-]/g, '');
    setNewLocation(cleaned);
  };

  // Strict input sanitization for edited quantity field
  const handleEditQuantityChange = (text) => {
    const cleaned = text.replace(/[^0-9a-zA-Z\s]/g, '');
    setEditQuantity(cleaned);
  };

  // Strict input sanitization: allow only letters and spaces for stock status
  const handleEditStatusChange = (text) => {
    const cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setEditStatus(cleaned);
  };

  // Open the full details modal for the clicked supply item
  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  // Pre-fill update modal inputs with current item data and switch modals
  const handleOpenUpdate = (item) => {
    setSelectedItem(item);
    setEditQuantity(item.quantity || '');
    setEditStatus(item.status || '');
    setDetailModalVisible(false);
    setUpdateModalVisible(true);
  };

  // Validate inputs and save a new supply record to Firebase Firestore
  const handleAddItem = async () => {
    if (!newItemName.trim() || !newQuantity.trim() || !newLocation.trim()) {
      showCrossPlatformAlert('Validation Error', 'Please fill in all required supply fields properly.');
      return;
    }

    const newItem = {
      itemName: newItemName.trim(),
      category: newCategory,
      quantity: newQuantity.trim(),
      location: newLocation.trim(),
      supplier: 'General Donor / Vendor',
      lastRestocked: new Date().toISOString().split('T')[0],
      status: 'In Stock',
    };

    try {
      // Insert new supply document into Firestore 'inventory' collection
      const docRef = await addDoc(collection(db, "inventory"), newItem);
      const savedItem = { id: docRef.id, ...newItem };

      // Update local state immediately and reset form inputs
      setInventoryList([savedItem, ...inventoryList]);
      setAddModalVisible(false);
      setNewItemName('');
      setNewQuantity('');
      setNewLocation('Main Warehouse');
      showCrossPlatformAlert('Success', 'New supply item added to Cloud successfully!');
    } catch (error) {
      showCrossPlatformAlert('Firebase Error', error.message);
    }
  };

  // Validate and update an existing supply item's quantity and status in Firestore
  const handleSaveUpdate = async () => {
    if (!editQuantity.trim() || !editStatus.trim()) {
      showCrossPlatformAlert('Validation Error', 'Quantity and Status cannot be empty.');
      return;
    }

    try {
      if (selectedItem && selectedItem.id) {
        await updateDoc(doc(db, "inventory", selectedItem.id), {
          quantity: editQuantity.trim(),
          status: editStatus.trim(),
        });
      }

      // Sync updated fields in local state array without re-fetching
      const updatedList = inventoryList.map((item) => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            quantity: editQuantity.trim(),
            status: editStatus.trim(),
          };
        }
        return item;
      });

      setInventoryList(updatedList);
      setUpdateModalVisible(false);
      showCrossPlatformAlert('Success', 'Supply stock updated successfully!');
    } catch (error) {
      showCrossPlatformAlert('Update Failed', error.message);
    }
  };

  // Delete a supply record from Firestore across Web and Mobile after confirmation
  const handleDeleteItem = async (item) => {
    if (!item || !item.id) return;

    const executeDeletion = async () => {
      try {
        // Delete document from Firestore 'inventory' collection by document ID
        await deleteDoc(doc(db, "inventory", item.id));

        // Remove deleted item from local state and close details modal
        setInventoryList(previous => previous.filter(entry => entry.id !== item.id));
        setDetailModalVisible(false);
        setSelectedItem(null);
        showCrossPlatformAlert('Success', 'Supply item deleted from Cloud.');
      } catch (error) {
        showCrossPlatformAlert('Delete Failed', error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete ${item.itemName}?`)) {
        await executeDeletion();
      }
    } else {
      Alert.alert(
        'Delete Supply Item',
        `Are you sure you want to delete ${item.itemName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: executeDeletion }
        ]
      );
    }
  };

  // Filter inventory dynamically by search query (item name or location) and category chip
  const filteredInventory = inventoryList.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate total distinct active categories currently stored in inventory
  const uniqueCategoriesCount = [...new Set(inventoryList.map(item => item.category))].length;

  return (
    <SafeAreaView style={globalStyles.container}>
      
      {/* Back navigation button to return to Home screen */}
      <TouchableOpacity 
        onPress={() => navigation.replace('Home')} 
        style={globalStyles.backArrowBtn}
        activeOpacity={0.6}
      >
        <Text style={globalStyles.backArrowText}>←</Text>
      </TouchableOpacity>

      {/* Top screen header with logo, Inventory title, and Profile shortcut */}
      <View style={globalStyles.header}>
        <Image source={require('../../assets/logo.png')} style={globalStyles.logoIcon} />
        <Text style={globalStyles.dashboardTitle}>Inventory 📦</Text>
        <TouchableOpacity 
          style={globalStyles.profileIconContainer} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={globalStyles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Top action bar with section title and + Add Supply button */}
        <View style={globalStyles.topBar}>
          <Text style={globalStyles.sectionTitle}>Supplies & Assets Stock</Text>
          <TouchableOpacity 
            style={globalStyles.registerButton} 
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={globalStyles.registerButtonText}>+ Add Supply</Text>
          </TouchableOpacity>
        </View>

        {/* Search input and horizontal category filter chips */}
        <View style={globalStyles.filterSection}>
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Search supplies or location..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={globalStyles.filterChipsRow}
          >
            {['All', 'Food', 'Medical', 'Stationery', 'Clothing'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  globalStyles.filterChip,
                  selectedCategoryFilter === cat && globalStyles.filterChipActive
                ]}
                onPress={() => setSelectedCategoryFilter(cat)}
              >
                <Text style={[
                  globalStyles.filterChipText,
                  selectedCategoryFilter === cat && globalStyles.filterChipTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable container rendering filtered inventory item cards */}
        <View style={globalStyles.mainCardContainerChild}>
          <ScrollView 
            style={globalStyles.innerScrollContainer} 
            contentContainerStyle={{ padding: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <Text style={globalStyles.noRecordText}>Loading cloud records...</Text>
            ) : filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <View key={item.id} style={globalStyles.childCard}>
                  {/* Item avatar badge showing first letter */}
                  <View style={globalStyles.avatarPlaceholder}>
                    <Text style={{ fontWeight: 'bold', color: '#0D47A1', fontSize: 16 }}>
                      {item.itemName ? item.itemName[0].toUpperCase() : 'I'}
                    </Text>
                  </View>
                  
                  {/* Item summary info (name, quantity, location, category, status) */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={globalStyles.childNameText}>{item.itemName}</Text>
                    <Text style={globalStyles.childDetailsText}>Qty: {item.quantity} | {item.location}</Text>
                    <Text style={globalStyles.caseText}>Category: {item.category} | Status: {item.status}</Text>
                  </View>

                  {/* Button to open item details modal */}
                  <TouchableOpacity 
                    style={globalStyles.viewDossierBtn} 
                    onPress={() => handleOpenDetail(item)}
                  >
                    <Text style={globalStyles.viewDossierText}>Details →</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={globalStyles.noRecordText}>No inventory items found in Cloud database.</Text>
            )}
          </ScrollView>
        </View>

        {/* Footer warehouse summary box */}
        <View style={globalStyles.footerInfoBox}>
          <Text style={globalStyles.footerInfoTitle}>📦 Warehouse Quick Summary</Text>
          <View style={globalStyles.footerStatsRow}>
            <Text style={globalStyles.footerStatText}>Total Categories: <Text style={{fontWeight: 'bold'}}>{uniqueCategoriesCount} Active</Text></Text>
            <Text style={globalStyles.footerStatText}><Text style={{color: '#0D47A1', fontWeight: 'bold'}}>Cloud Synced Database</Text></Text>
          </View>
        </View>

        {/* 1. ITEM DETAILS MODAL */}
        {selectedItem && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={detailModalVisible}
            onRequestClose={() => setDetailModalVisible(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContentLarge}>
                
                {/* Modal header and close icon */}
                <View style={globalStyles.modalHeaderRow}>
                  <Text style={globalStyles.modalTitle}>Supply Item Details</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Item banner */}
                  <View style={globalStyles.modalProfileRow}>
                    <View style={globalStyles.avatarPlaceholderLarge}>
                      <Text style={{ fontWeight: 'bold', color: '#0D47A1', fontSize: 18 }}>
                        {selectedItem.itemName ? selectedItem.itemName[0] : 'I'}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={globalStyles.modalChildName}>{selectedItem.itemName}</Text>
                      <Text style={globalStyles.modalChildSub}>Category: {selectedItem.category}</Text>
                    </View>
                  </View>

                  {/* Detailed stock information box */}
                  <View style={globalStyles.modalDataBox}>
                    <Text style={globalStyles.sectionHeaderSmall}>📋 Stock Information</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Quantity Available:</Text> {selectedItem.quantity}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Storage Location:</Text> {selectedItem.location}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Supplier / Donor:</Text> {selectedItem.supplier}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Last Restocked:</Text> {selectedItem.lastRestocked}</Text>
                    <Text style={globalStyles.dataRow}><Text style={globalStyles.dataLabel}>Status:</Text> <Text style={{color: '#2E7D32', fontWeight: 'bold'}}>{selectedItem.status}</Text></Text>
                  </View>
                </ScrollView>

                {/* Open update stock & status modal */}
                <TouchableOpacity 
                  style={globalStyles.updateButton} 
                  onPress={() => handleOpenUpdate(selectedItem)}
                >
                  <Text style={globalStyles.updateButtonText}>Update Stock & Status</Text>
                </TouchableOpacity>

                {/* Delete selected supply item from Firestore */}
                <TouchableOpacity 
                  style={[globalStyles.closeModalButton, { backgroundColor: '#C62828', marginBottom: 8 }]} 
                  onPress={() => handleDeleteItem(selectedItem)}
                >
                  <Text style={[globalStyles.closeModalButtonText, { color: '#FFFFFF' }]}>Delete Supply Item</Text>
                </TouchableOpacity>

                {/* Close details modal */}
                <TouchableOpacity 
                  style={globalStyles.closeModalButton} 
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={globalStyles.closeModalButtonText}>Close Details</Text>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>
        )}

        {/* 2. ADD SUPPLY MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              
              {/* Add supply modal header */}
              <View style={globalStyles.modalHeaderRow}>
                <Text style={globalStyles.modalTitle}>Add New Supply / Stock</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Supply item name input */}
                <Text style={globalStyles.inputLabel}>Item Name *</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. Winter Jackets" 
                  placeholderTextColor="#888"
                  value={newItemName}
                  onChangeText={handleItemNameChange}
                />

                {/* Horizontal category selection chips */}
                <Text style={globalStyles.inputLabel}>Category *</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ flexDirection: 'row', marginBottom: 6 }}
                >
                  {['Food', 'Medical', 'Stationery', 'Clothing'].map((cat) => (
                    <TouchableOpacity 
                      key={cat}
                      style={[globalStyles.modalChip, newCategory === cat && globalStyles.modalChipActive, { marginRight: 6 }]}
                      onPress={() => setNewCategory(cat)}
                    >
                      <Text style={[globalStyles.modalChipText, newCategory === cat && globalStyles.modalChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Quantity & units input */}
                <Text style={globalStyles.inputLabel}>Quantity & Units *</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. 50 Packets" 
                  placeholderTextColor="#888"
                  value={newQuantity}
                  onChangeText={handleQuantityChange}
                />

                {/* Storage location input */}
                <Text style={globalStyles.inputLabel}>Storage Location *</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. Main Warehouse" 
                  placeholderTextColor="#888"
                  value={newLocation}
                  onChangeText={handleLocationChange}
                />

                {/* Submit button to save supply item to Firestore */}
                <TouchableOpacity 
                  style={globalStyles.saveButton} 
                  onPress={handleAddItem}
                >
                  <Text style={globalStyles.saveButtonText}>Save Supply Record</Text>
                </TouchableOpacity>
              </ScrollView>

            </View>
          </View>
        </Modal>

        {/* 3. UPDATE STOCK & STATUS MODAL */}
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
                <Text style={globalStyles.modalTitle}>Update Stock & Status</Text>
                <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Editable quantity input */}
                <Text style={globalStyles.inputLabel}>New Quantity & Unit</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  value={editQuantity}
                  onChangeText={handleEditQuantityChange}
                />

                {/* Editable stock status input */}
                <Text style={globalStyles.inputLabel}>Stock Status (Letters Only)</Text>
                <TextInput 
                  style={globalStyles.textInput} 
                  placeholder="e.g. In Stock"
                  placeholderTextColor="#888"
                  value={editStatus}
                  onChangeText={handleEditStatusChange}
                />

                {/* Submit button to persist updated stock values */}
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