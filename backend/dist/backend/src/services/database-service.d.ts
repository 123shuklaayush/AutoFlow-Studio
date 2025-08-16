/**
 * @fileoverview Database service abstraction layer
 * @author Ayush Shukla
 * @description Provides database operations with Firebase Firestore backend
 */
/**
 * Database service class providing CRUD operations
 * Follows Repository pattern for data access
 */
export declare class DatabaseService {
    private firestore;
    private initialized;
    /**
     * Initialize the database service
     */
    initialize(): Promise<void>;
    /**
     * Get Firestore instance
     * @private
     */
    private getFirestore;
    /**
     * Generic create operation
     * @param collection - Collection name
     * @param data - Document data
     * @param docId - Optional document ID
     * @returns Created document ID
     */
    create(collection: string, data: any, docId?: string): Promise<string>;
    /**
     * Generic read operation
     * @param collection - Collection name
     * @param docId - Document ID
     * @returns Document data or null
     */
    read(collection: string, docId: string): Promise<any | null>;
    /**
     * Generic update operation
     * @param collection - Collection name
     * @param docId - Document ID
     * @param data - Update data
     * @returns Success boolean
     */
    update(collection: string, docId: string, data: any): Promise<boolean>;
    /**
     * Generic delete operation
     * @param collection - Collection name
     * @param docId - Document ID
     * @returns Success boolean
     */
    delete(collection: string, docId: string): Promise<boolean>;
    /**
     * Generic list operation with pagination
     * @param collection - Collection name
     * @param options - Query options
     * @returns Array of documents
     */
    list(collection: string, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDirection?: 'asc' | 'desc';
        where?: Array<{
            field: string;
            operator: any;
            value: any;
        }>;
    }): Promise<any[]>;
    /**
     * Count documents in a collection
     * @param collection - Collection name
     * @param where - Optional where conditions
     * @returns Document count
     */
    count(collection: string, where?: Array<{
        field: string;
        operator: any;
        value: any;
    }>): Promise<number>;
    /**
     * Check if document exists
     * @param collection - Collection name
     * @param docId - Document ID
     * @returns Exists boolean
     */
    exists(collection: string, docId: string): Promise<boolean>;
    /**
     * Batch write operations
     * @param operations - Array of operations
     * @returns Success boolean
     */
    batch(operations: Array<{
        type: 'create' | 'update' | 'delete';
        collection: string;
        docId?: string;
        data?: any;
    }>): Promise<boolean>;
    /**
     * Transaction operation
     * @param callback - Transaction callback
     * @returns Transaction result
     */
    transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T>;
    /**
     * Disconnect from database (cleanup)
     */
    disconnect(): Promise<void>;
    /**
     * Get connection status
     */
    isConnected(): boolean;
}
//# sourceMappingURL=database-service.d.ts.map