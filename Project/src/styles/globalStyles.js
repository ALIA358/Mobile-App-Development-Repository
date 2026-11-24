// src/styles/globalStyles.js
import { StyleSheet, Platform, StatusBar } from 'react-native';
export const globalStyles = StyleSheet.create({
headerWithImage: {
  width: '100%',
  paddingVertical: 15,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  // Agar aap border radius ya styling dena chahein
  borderBottomLeftRadius: 15,
  borderBottomRightRadius: 15,
  overflow: 'hidden',
},
  container: {    //splash
    flex: 1,
    backgroundColor: '#eb8cac',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 25 : 0, //Fallback
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 4,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#444444',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
//login
logoIcon: {
  width: 60,
  height: 60,
  resizeMode: 'contain',
},
 innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 12,
    color: '#444444',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#f5d2df',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8b5c8',
    elevation: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  switchRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 12,
    color: '#555555',
  },
 
  //homescreen
backArrowBtn: {
    position: 'absolute',
    left: 12,
    top: 40, 
    zIndex: 10,
    padding: 4,
  },
  backArrowText: {
    fontSize: 33,
    fontWeight: '900', // Extra bold arrow
    color: '#000000',
    // Soft shadow effect 
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 5,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileEmoji: {
    fontSize: 14,
  },
  mainCardContainer: {
    backgroundColor: '#f5d2df',
    borderRadius: 22,
    padding: 22,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: '#e8b5c8',
    marginTop: 22,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moduleCard: { 
    flex: 1,
    borderRadius: 15, 
    width: '48%',
    padding: 15, 
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 125,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    elevation: 5,
  },
  moduleEmoji: { 
    fontSize: 32,
    marginBottom: 8,
  },
  moduleNameText: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
  },
  moduleDetailsText: { 
    fontSize: 10, 
    color: '#555', 
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },

 //child welfare
 
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  registerButton: { backgroundColor: '#00796B', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  registerButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  
  filterSection: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#0D47A1',
    borderColor: '#0D47A1',
  },
  filterChipText: {
    fontSize: 11,
    color: '#444',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  modalChip: {
    flex: 1,
    backgroundColor: '#F1F3F4',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modalChipActive: {
    backgroundColor: '#0D47A1',
    borderColor: '#0D47A1',
  },
  modalChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  modalChipTextActive: {
    color: '#FFFFFF',
  },
mainCardContainerChild: {
    backgroundColor: '#f0c6d4',
    borderRadius: 20,
    padding: 10,
    height: 340,
    borderWidth: 1,
    borderColor: '#e2b0c2',
    marginTop: 4,
  },
  innerScrollContainer: {
    flexGrow: 1,
  },
  noRecordText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    marginVertical: 20,
  },
//profiles
  footerInfoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  footerInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 6,
  },
  footerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatText: {
    fontSize: 11,
    color: '#555',
  },
modalHeadingText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 13,
    marginTop: 6,
  },
  modalBodyText: {
    color: '#555',
    fontSize: 12,
    marginBottom: 6,
  },
  modalPrimaryTitle: {
    fontWeight: 'bold',
    color: '#0D47A1',
    fontSize: 14,
    marginBottom: 4,
  },
  modalParagraph: {
    color: '#444',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  supportRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
// Reusable Support Row Button Style (DRY)
  supportRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Reusable Modal Close Cross Button Text Style
  modalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Reusable Compact User Card Style
  compactUserCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    minHeight: 0,
    height: 'auto',
  },

  // Reusable Support Section Container Style
  supportContainer: {
    padding: 14,
    marginBottom: 18,
    width: '100%',
    minHeight: 0,
    height: 'auto',
    gap: 10,
  },

  //modules styling
  childCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    elevation: 2 
  },
  avatarPlaceholder: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#E3F2FD', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBDEFB'
  },
  childNameText: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  childDetailsText: { fontSize: 11, color: '#666', marginTop: 2 },
  caseText: { fontSize: 11, color: '#00796B', marginTop: 2, fontWeight: '600' },
  viewDossierBtn: { backgroundColor: '#E0F2F1', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#B2DFDB' },
  viewDossierText: { color: '#00796B', fontSize: 11, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, maxHeight: '85%', elevation: 5 },
  modalContentLarge: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 420, maxHeight: '85%', elevation: 5 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  modalProfileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarPlaceholderLarge: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#E3F2FD', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBDEFB'
  },
  modalChildName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  modalChildSub: { fontSize: 11, color: '#666', marginTop: 2 },
  modalDataBox: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  sectionHeaderSmall: { fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 6 },
  dataRow: { fontSize: 12, color: '#333', marginBottom: 4 },
  dataLabel: { fontWeight: 'bold', color: '#444' },
  updateButton: { backgroundColor: '#1E88E5', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  updateButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  closeModalButton: { backgroundColor: '#101828', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  closeModalButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#444', marginBottom: 4, marginTop: 10 },
  textInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#FAFAFA' },
  saveButton: { backgroundColor: '#00796B', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  saveButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

  