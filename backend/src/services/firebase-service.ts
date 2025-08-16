/**
 * @fileoverview Firebase service initialization and configuration
 * @author Ayush Shukla
 * @description Firebase Admin SDK setup for AutoFlow Studio backend
 */

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { logger } from '../utils/simple-logger';
import { getDatabaseConfig } from '../utils/environment';

/**
 * Firebase service class following Singleton pattern
 */
class FirebaseService {
  private static instance: FirebaseService;
  private firestore: Firestore | null = null;
  private storage: Storage | null = null;
  private initialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance of Firebase service
   */
  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Firebase already initialized');
      return;
    }

    try {
      logger.info('Initializing Firebase Admin SDK...');

      // Get configuration from environment
      const config = getDatabaseConfig();

      // Check if Firebase app is already initialized
      if (getApps().length === 0) {
        // Create service account object
        const serviceAccount: ServiceAccount = {
          projectId: config.projectId,
          privateKey: config.privateKey,
          clientEmail: config.clientEmail
        };

        // Initialize Firebase Admin SDK
        initializeApp({
          credential: cert(serviceAccount),
          projectId: config.projectId,
          storageBucket: `${config.projectId}.appspot.com`
        });
      }

      // Initialize Firestore
      this.firestore = getFirestore();
      
      // Configure Firestore settings
      this.firestore.settings({
        ignoreUndefinedProperties: true
      });

      // Initialize Storage
      this.storage = getStorage();

      this.initialized = true;
      logger.info('✅ Firebase Admin SDK initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    if (!this.firestore || !this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.firestore;
  }

  /**
   * Get Storage instance
   */
  getStorage(): Storage {
    if (!this.storage || !this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.storage;
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Test Firebase connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Test Firestore connection by writing and reading a test document
      const testDoc = this.firestore!.collection('_test').doc('connection');
      await testDoc.set({ timestamp: new Date(), test: true });
      
      const testRead = await testDoc.get();
      if (!testRead.exists) {
        throw new Error('Test document not found after write');
      }

      // Clean up test document
      await testDoc.delete();

      logger.info('✅ Firebase connection test successful');
      return true;

    } catch (error) {
      logger.error('❌ Firebase connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const firestore = this.getFirestore();
      
      // Count documents in main collections
      const collections = ['users', 'workflows', 'sessions', 'executions'];
      const stats: any = {
        timestamp: new Date().toISOString(),
        collections: {}
      };

      for (const collectionName of collections) {
        try {
          const snapshot = await firestore.collection(collectionName).count().get();
          stats.collections[collectionName] = snapshot.data().count;
        } catch (error) {
          logger.warn(`Could not get stats for collection ${collectionName}:`, error);
          stats.collections[collectionName] = 'unavailable';
        }
      }

      return stats;

    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }
}

/**
 * Global Firebase service instance
 */
const firebaseService = FirebaseService.getInstance();

/**
 * Initialize Firebase (called from main server)
 */
export async function setupFirebase(): Promise<void> {
  await firebaseService.initialize();
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  return firebaseService.getFirestore();
}

/**
 * Get Storage instance
 */
export function getStorageInstance(): Storage {
  return firebaseService.getStorage();
}

/**
 * Test Firebase connection
 */
export async function testFirebaseConnection(): Promise<boolean> {
  return firebaseService.testConnection();
}

/**
 * Get database statistics
 */
export async function getFirebaseStats(): Promise<any> {
  return firebaseService.getDatabaseStats();
}

/**
 * Export Firebase service instance
 */
export { firebaseService };
export default firebaseService;
