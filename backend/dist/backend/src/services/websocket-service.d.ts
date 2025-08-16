/**
 * @fileoverview WebSocket service for real-time communication
 * @author Ayush Shukla
 * @description WebSocket server for real-time workflow execution updates
 */
import { Server as HTTPServer } from 'http';
/**
 * WebSocket message types
 */
export declare enum WSMessageType {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    PING = "ping",
    PONG = "pong",
    EXECUTION_STARTED = "execution_started",
    EXECUTION_STEP = "execution_step",
    EXECUTION_COMPLETED = "execution_completed",
    EXECUTION_FAILED = "execution_failed",
    EXECUTION_PAUSED = "execution_paused",
    RECORDING_STARTED = "recording_started",
    RECORDING_STEP = "recording_step",
    RECORDING_STOPPED = "recording_stopped",
    COMPILATION_PROGRESS = "compilation_progress",
    COMPILATION_COMPLETED = "compilation_completed",
    SYSTEM_STATUS = "system_status",
    ERROR = "error"
}
/**
 * WebSocket message interface
 */
export interface WSMessage {
    type: WSMessageType;
    data?: any;
    timestamp?: number;
    clientId?: string;
    userId?: string;
}
/**
 * WebSocket service class
 */
declare class WebSocketService {
    private wss;
    private clients;
    private heartbeatInterval;
    /**
     * Initialize WebSocket server
     * @param httpServer - HTTP server instance
     */
    initialize(httpServer: HTTPServer): void;
    /**
     * Verify client connection (authentication can be added here)
     * @param info - Connection info
     * @returns Whether client is allowed to connect
     * @private
     */
    private verifyClient;
    /**
     * Handle new WebSocket connection
     * @param ws - WebSocket connection
     * @param request - HTTP request
     * @private
     */
    private handleConnection;
    /**
     * Handle incoming message from client
     * @param clientId - Client ID
     * @param data - Message data
     * @private
     */
    private handleMessage;
    /**
     * Handle client ping
     * @param clientId - Client ID
     * @private
     */
    private handlePing;
    /**
     * Handle client pong response
     * @param clientId - Client ID
     * @private
     */
    private handlePong;
    /**
     * Handle client disconnect
     * @param clientId - Client ID
     * @private
     */
    private handleDisconnect;
    /**
     * Handle connection error
     * @param clientId - Client ID
     * @param error - Error object
     * @private
     */
    private handleError;
    /**
     * Send message to specific client
     * @param clientId - Client ID
     * @param message - Message to send
     */
    sendToClient(clientId: string, message: WSMessage): void;
    /**
     * Broadcast message to all connected clients
     * @param message - Message to broadcast
     * @param excludeClient - Optional client ID to exclude
     */
    broadcast(message: WSMessage, excludeClient?: string): void;
    /**
     * Send error message to client
     * @param clientId - Client ID
     * @param errorMessage - Error message
     * @private
     */
    private sendError;
    /**
     * Set up heartbeat mechanism to detect dead connections
     * @private
     */
    private setupHeartbeat;
    /**
     * Generate unique client ID
     * @returns Unique client ID
     * @private
     */
    private generateClientId;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get client information
     */
    getClientInfo(): Array<{
        id: string;
        userId?: string;
        subscriptions: string[];
    }>;
    /**
     * Cleanup and close WebSocket server
     */
    close(): void;
}
/**
 * Global WebSocket service instance
 */
declare const webSocketService: WebSocketService;
/**
 * Initialize WebSocket server
 * @param httpServer - HTTP server instance
 */
export declare function setupWebSocket(httpServer: HTTPServer): void;
/**
 * Send message to specific client
 */
export declare function sendToClient(clientId: string, message: WSMessage): void;
/**
 * Broadcast message to all clients
 */
export declare function broadcast(message: WSMessage, excludeClient?: string): void;
/**
 * Get WebSocket service statistics
 */
export declare function getWebSocketStats(): {
    connectedClients: number;
    clients: {
        id: string;
        userId?: string;
        subscriptions: string[];
    }[];
};
/**
 * Export WebSocket service
 */
export { webSocketService };
export default webSocketService;
//# sourceMappingURL=websocket-service.d.ts.map