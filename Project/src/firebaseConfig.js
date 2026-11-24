import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxLIb3CNCmk4JC7p-JwSA2-5icNRgDbbY",
  authDomain: "orphanagemanagementsyste-f0161.firebaseapp.com",
  projectId: "orphanagemanagementsyste-f0161",
  storageBucket: "orphanagemanagementsyste-f0161.firebasestorage.app",
  messagingSenderId: "793259726601",
  appId: "1:793259726601:web:41f3d202d649de71aee5d8",
  measurementId: "G-QFFR61RRY4"
};

const app = initializeApp(firebaseConfig);

// Authentication according to Platform   (Web vs Mobile)
export const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

export const db = getFirestore(app);