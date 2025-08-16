/**
 * @fileoverview Database service abstraction layer
 * @author Ayush Shukla
 * @description Provides database operations with Firebase Firestore backend
 */

import { Firestore } from 'firebase-admin/firestore';
import { getFirestoreInstance } from './firebase-service';
import { logger } from '../utils/simple-logger';
import { Workflow } from '@shared/types/core';

/**
 * Database service class providing CRUD operations
 * Follows Repository pattern for data access
 */
export class DatabaseService {
  private firestore: Firestore | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the database service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Database service already initialized');
      return;
    }

    try {
      this.firestore = getFirestoreInstance();
      this.initialized = true;
      logger.info('✅ Database service initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Get Firestore instance
   * @private
   */
  private getFirestore(): Firestore {
    if (!this.firestore || !this.initialized) {
      throw new Error('Database service not initialized');
    }
    return this.firestore;
  }

  /**
   * Generic create operation
   * @param collection - Collection name
   * @param data - Document data
   * @param docId - Optional document ID
   * @returns Created document ID
   */
  async create(collection: string, data: any, docId?: string): Promise<string> {
    try {
      const db = this.getFirestore();
      const timestamp = new Date();
      
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      let docRef;
      if (docId) {
        docRef = db.collection(collection).doc(docId);
        await docRef.set(docData);
      } else {
        docRef = await db.collection(collection).add(docData);
      }

      logger.debug(`Document created in ${collection}:`, docRef.id);
      return docRef.id;

    } catch (error) {
      logger.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generic read operation
   * @param collection - Collection name
   * @param docId - Document ID
   * @returns Document data or null
   */
  async read(collection: string, docId: string): Promise<any | null> {
    try {
      const db = this.getFirestore();
      const doc = await db.collection(collection).doc(docId).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };

    } catch (error) {
      logger.error(`Error reading document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generic update operation
   * @param collection - Collection name
   * @param docId - Document ID
   * @param data - Update data
   * @returns Success boolean
   */
  async update(collection: string, docId: string, data: any): Promise<boolean> {
    try {
      const db = this.getFirestore();
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await db.collection(collection).doc(docId).update(updateData);
      logger.debug(`Document updated in ${collection}:`, docId);
      return true;

    } catch (error) {
      logger.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generic delete operation
   * @param collection - Collection name
   * @param docId - Document ID
   * @returns Success boolean
   */
  async delete(collection: string, docId: string): Promise<boolean> {
    try {
      const db = this.getFirestore();
      await db.collection(collection).doc(docId).delete();
      logger.debug(`Document deleted from ${collection}:`, docId);
      return true;

    } catch (error) {
      logger.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generic list operation with pagination
   * @param collection - Collection name
   * @param options - Query options
   * @returns Array of documents
   */
  async list(collection: string, options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    where?: Array<{ field: string; operator: any; value: any }>;
  } = {}): Promise<any[]> {
    try {
      const db = this.getFirestore();
      let query: any = db.collection(collection);

      // Apply where clauses
      if (options.where) {
        for (const condition of options.where) {
          query = query.where(condition.field, condition.operator, condition.value);
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
      }

      // Apply pagination
      if (options.offset) {
        query = query.offset(options.offset);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return documents;

    } catch (error) {
      logger.error(`Error listing documents from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Count documents in a collection
   * @param collection - Collection name
   * @param where - Optional where conditions
   * @returns Document count
   */
  async count(collection: string, where?: Array<{ field: string; operator: any; value: any }>): Promise<number> {
    try {
      const db = this.getFirestore();
      let query: any = db.collection(collection);

      // Apply where clauses
      if (where) {
        for (const condition of where) {
          query = query.where(condition.field, condition.operator, condition.value);
        }
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;

    } catch (error) {
      logger.error(`Error counting documents in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Check if document exists
   * @param collection - Collection name
   * @param docId - Document ID
   * @returns Exists boolean
   */
  async exists(collection: string, docId: string): Promise<boolean> {
    try {
      const db = this.getFirestore();
      const doc = await db.collection(collection).doc(docId).get();
      return doc.exists;

    } catch (error) {
      logger.error(`Error checking if document exists in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Batch write operations
   * @param operations - Array of operations
   * @returns Success boolean
   */
  async batch(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data?: any;
  }>): Promise<boolean> {
    try {
      const db = this.getFirestore();
      const batch = db.batch();

      for (const operation of operations) {
        const docRef = operation.docId 
          ? db.collection(operation.collection).doc(operation.docId)
          : db.collection(operation.collection).doc();

        switch (operation.type) {
          case 'create':
            batch.set(docRef, {
              ...operation.data,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            break;

          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: new Date()
            });
            break;

          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();
      logger.debug(`Batch operation completed with ${operations.length} operations`);
      return true;

    } catch (error) {
      logger.error('Error executing batch operation:', error);
      throw error;
    }
  }

  /**
   * Transaction operation
   * @param callback - Transaction callback
   * @returns Transaction result
   */
  async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
    try {
      const db = this.getFirestore();
      return await db.runTransaction(callback);

    } catch (error) {
      logger.error('Error executing transaction:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database (cleanup)
   */
  async disconnect(): Promise<void> {
    if (this.initialized) {
      this.firestore = null;
      this.initialized = false;
      logger.info('✅ Database service disconnected');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.initialized && this.firestore !== null;
  }
}
