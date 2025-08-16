/**
 * @fileoverview Firebase service initialization and configuration
 * @author Ayush Shukla
 * @description Firebase Admin SDK setup for AutoFlow Studio backend
 */
import { Firestore } from 'firebase-admin/firestore';
import { Storage } from 'firebase-admin/storage';
/**
 * Firebase service class following Singleton pattern
 */
declare class FirebaseService {
    private static instance;
    private firestore;
    private storage;
    private initialized;
    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor();
    /**
     * Get singleton instance of Firebase service
     */
    static getInstance(): FirebaseService;
    /**
     * Initialize Firebase Admin SDK
     */
    initialize(): Promise<void>;
    /**
     * Get Firestore instance
     */
    getFirestore(): Firestore;
    /**
     * Get Storage instance
     */
    getStorage(): Storage;
    /**
     * Check if Firebase is initialized
     */
    isInitialized(): boolean;
    /**
     * Test Firebase connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get database statistics
     */
    getDatabaseStats(): Promise<any>;
}
/**
 * Global Firebase service instance
 */
declare const firebaseService: FirebaseService;
/**
 * Initialize Firebase (called from main server)
 */
export declare function setupFirebase(): Promise<void>;
/**
 * Get Firestore instance
 */
export declare function getFirestoreInstance(): Firestore;
/**
 * Get Storage instance
 */
export declare function getStorageInstance(): Storage;
/**
 * Test Firebase connection
 */
export declare function testFirebaseConnection(): Promise<boolean>;
/**
 * Get database statistics
 */
export declare function getFirebaseStats(): Promise<any>;
/**
 * Export Firebase service instance
 */
export { firebaseService };
export default firebaseService;
//# sourceMappingURL=firebase-service.d.ts.map