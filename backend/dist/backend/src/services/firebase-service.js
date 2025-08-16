"use strict";
/**
 * @fileoverview Firebase service initialization and configuration
 * @author Ayush Shukla
 * @description Firebase Admin SDK setup for AutoFlow Studio backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseService = void 0;
exports.setupFirebase = setupFirebase;
exports.getFirestoreInstance = getFirestoreInstance;
exports.getStorageInstance = getStorageInstance;
exports.testFirebaseConnection = testFirebaseConnection;
exports.getFirebaseStats = getFirebaseStats;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const simple_logger_1 = require("../utils/simple-logger");
const environment_1 = require("../utils/environment");
/**
 * Firebase service class following Singleton pattern
 */
class FirebaseService {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        this.firestore = null;
        this.storage = null;
        this.initialized = false;
    }
    /**
     * Get singleton instance of Firebase service
     */
    static getInstance() {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }
    /**
     * Initialize Firebase Admin SDK
     */
    async initialize() {
        if (this.initialized) {
            simple_logger_1.logger.debug("Firebase already initialized");
            return;
        }
        try {
            simple_logger_1.logger.info("Initializing Firebase Admin SDK...");
            // Get configuration from environment
            const config = (0, environment_1.getDatabaseConfig)();
            // Check if we have real credentials
            if (config.privateKey === "demo-key-replace-with-real-key" ||
                config.projectId === "demo-project" ||
                config.privateKey.includes("DEMO") ||
                config.privateKey.includes("PLEASE_GENERATE_SERVICE_ACCOUNT_KEY")) {
                throw new Error(`
❌ FIREBASE SETUP ERROR: Using dummy credentials!

Please set up real Firebase credentials:
1. Download service account key from Firebase Console
2. Set FIREBASE_PROJECT_ID=${config.projectId}
3. Set FIREBASE_PRIVATE_KEY="your-real-private-key"  
4. Set FIREBASE_CLIENT_EMAIL="your-real-client-email"

Current values are dummy/placeholder values.
        `);
            }
            // Check if Firebase app is already initialized
            if ((0, app_1.getApps)().length === 0) {
                // Create service account object
                const serviceAccount = {
                    projectId: config.projectId,
                    privateKey: config.privateKey,
                    clientEmail: config.clientEmail,
                };
                // Initialize Firebase Admin SDK
                (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                    projectId: config.projectId,
                    storageBucket: `${config.projectId}.appspot.com`,
                });
            }
            // Initialize Firestore
            this.firestore = (0, firestore_1.getFirestore)();
            // Configure Firestore settings
            this.firestore.settings({
                ignoreUndefinedProperties: true,
            });
            // Initialize Storage
            this.storage = (0, storage_1.getStorage)();
            this.initialized = true;
            simple_logger_1.logger.info("✅ Firebase Admin SDK initialized successfully");
        }
        catch (error) {
            simple_logger_1.logger.error("❌ Failed to initialize Firebase Admin SDK:", error);
            throw new Error(`Firebase initialization failed: ${error?.message || "Unknown error"}`);
        }
    }
    /**
     * Get Firestore instance
     */
    getFirestore() {
        if (!this.firestore || !this.initialized) {
            throw new Error("Firebase not initialized. Call initialize() first.");
        }
        return this.firestore;
    }
    /**
     * Get Storage instance
     */
    getStorage() {
        if (!this.storage || !this.initialized) {
            throw new Error("Firebase not initialized. Call initialize() first.");
        }
        return this.storage;
    }
    /**
     * Check if Firebase is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Test Firebase connection
     */
    async testConnection() {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            // Test Firestore connection by writing and reading a test document
            const testDoc = this.firestore.collection("_test").doc("connection");
            await testDoc.set({ timestamp: new Date(), test: true });
            const testRead = await testDoc.get();
            if (!testRead.exists) {
                throw new Error("Test document not found after write");
            }
            // Clean up test document
            await testDoc.delete();
            simple_logger_1.logger.info("✅ Firebase connection test successful");
            return true;
        }
        catch (error) {
            simple_logger_1.logger.error("❌ Firebase connection test failed:", error);
            return false;
        }
    }
    /**
     * Get database statistics
     */
    async getDatabaseStats() {
        try {
            const firestore = this.getFirestore();
            // Count documents in main collections
            const collections = ["users", "workflows", "sessions", "executions"];
            const stats = {
                timestamp: new Date().toISOString(),
                collections: {},
            };
            for (const collectionName of collections) {
                try {
                    const snapshot = await firestore
                        .collection(collectionName)
                        .count()
                        .get();
                    stats.collections[collectionName] = snapshot.data().count;
                }
                catch (error) {
                    simple_logger_1.logger.warn(`Could not get stats for collection ${collectionName}:`, error);
                    stats.collections[collectionName] = "unavailable";
                }
            }
            return stats;
        }
        catch (error) {
            simple_logger_1.logger.error("Error getting database stats:", error);
            throw error;
        }
    }
}
/**
 * Global Firebase service instance
 */
const firebaseService = FirebaseService.getInstance();
exports.firebaseService = firebaseService;
/**
 * Initialize Firebase (called from main server)
 */
async function setupFirebase() {
    await firebaseService.initialize();
}
/**
 * Get Firestore instance
 */
function getFirestoreInstance() {
    return firebaseService.getFirestore();
}
/**
 * Get Storage instance
 */
function getStorageInstance() {
    return firebaseService.getStorage();
}
/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
    return firebaseService.testConnection();
}
/**
 * Get database statistics
 */
async function getFirebaseStats() {
    return firebaseService.getDatabaseStats();
}
exports.default = firebaseService;
//# sourceMappingURL=firebase-service.js.map