/**
 * Firebase Configuration for AutoFlow Studio Chrome Extension
 * This is the client-side Firebase config for the Chrome Extension
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Note: These are client-side credentials - safe to be public
const firebaseConfig = {
  apiKey: "AIzaSyA-h1tfLSR9O5AOA5nY3ZSDlVXXO_l_9S4",
  authDomain: "autoflow-studio-e90b4.firebaseapp.com",
  projectId: "autoflow-studio-e90b4",
  storageBucket: "autoflow-studio-e90b4.firebasestorage.app",
  messagingSenderId: "1075943718639",
  appId: "1:1075943718639:web:73f35f1680134c6025e51a",
  measurementId: "G-JP718EDTTY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;

/**
 * Firebase project information:
 * - Project ID: autoflow-studio-e90b4
 * - Auth Domain: autoflow-studio-e90b4.firebaseapp.com
 * - Storage Bucket: autoflow-studio-e90b4.firebasestorage.app
 */
