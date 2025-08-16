"use strict";
/**
 * @fileoverview WebSocket service for real-time communication
 * @author Ayush Shukla
 * @description WebSocket server for real-time workflow execution updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = exports.WSMessageType = void 0;
exports.setupWebSocket = setupWebSocket;
exports.sendToClient = sendToClient;
exports.broadcast = broadcast;
exports.getWebSocketStats = getWebSocketStats;
const ws_1 = __importDefault(require("ws"));
const simple_logger_1 = require("../utils/simple-logger");
/**
 * WebSocket message types
 */
var WSMessageType;
(function (WSMessageType) {
    // Connection management
    WSMessageType["CONNECT"] = "connect";
    WSMessageType["DISCONNECT"] = "disconnect";
    WSMessageType["PING"] = "ping";
    WSMessageType["PONG"] = "pong";
    // Workflow execution events
    WSMessageType["EXECUTION_STARTED"] = "execution_started";
    WSMessageType["EXECUTION_STEP"] = "execution_step";
    WSMessageType["EXECUTION_COMPLETED"] = "execution_completed";
    WSMessageType["EXECUTION_FAILED"] = "execution_failed";
    WSMessageType["EXECUTION_PAUSED"] = "execution_paused";
    // Recording events
    WSMessageType["RECORDING_STARTED"] = "recording_started";
    WSMessageType["RECORDING_STEP"] = "recording_step";
    WSMessageType["RECORDING_STOPPED"] = "recording_stopped";
    // Compilation events
    WSMessageType["COMPILATION_PROGRESS"] = "compilation_progress";
    WSMessageType["COMPILATION_COMPLETED"] = "compilation_completed";
    // System events
    WSMessageType["SYSTEM_STATUS"] = "system_status";
    WSMessageType["ERROR"] = "error";
})(WSMessageType || (exports.WSMessageType = WSMessageType = {}));
/**
 * WebSocket service class
 */
class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.heartbeatInterval = null;
    }
    /**
     * Initialize WebSocket server
     * @param httpServer - HTTP server instance
     */
    initialize(httpServer) {
        try {
            this.wss = new ws_1.default.Server({
                server: httpServer,
                path: '/ws',
                verifyClient: this.verifyClient.bind(this)
            });
            this.wss.on('connection', this.handleConnection.bind(this));
            this.setupHeartbeat();
            simple_logger_1.logger.info('✅ WebSocket server initialized on /ws');
        }
        catch (error) {
            simple_logger_1.logger.error('❌ Failed to initialize WebSocket server:', error);
            throw error;
        }
    }
    /**
     * Verify client connection (authentication can be added here)
     * @param info - Connection info
     * @returns Whether client is allowed to connect
     * @private
     */
    verifyClient(info) {
        // For now, allow all connections
        // In production, verify JWT token or other authentication
        return true;
    }
    /**
     * Handle new WebSocket connection
     * @param ws - WebSocket connection
     * @param request - HTTP request
     * @private
     */
    handleConnection(ws, request) {
        const clientId = this.generateClientId();
        const client = {
            id: clientId,
            ws,
            subscriptions: new Set(),
            lastPing: Date.now(),
            isAlive: true
        };
        this.clients.set(clientId, client);
        // Set up event handlers
        ws.on('message', (data) => this.handleMessage(clientId, data));
        ws.on('close', () => this.handleDisconnect(clientId));
        ws.on('error', (error) => this.handleError(clientId, error));
        ws.on('pong', () => this.handlePong(clientId));
        // Send welcome message
        this.sendToClient(clientId, {
            type: WSMessageType.CONNECT,
            data: { clientId },
            timestamp: Date.now()
        });
        simple_logger_1.logger.debug(`WebSocket client connected: ${clientId}`);
    }
    /**
     * Handle incoming message from client
     * @param clientId - Client ID
     * @param data - Message data
     * @private
     */
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case WSMessageType.PING:
                    this.handlePing(clientId);
                    break;
                case WSMessageType.DISCONNECT:
                    this.handleDisconnect(clientId);
                    break;
                default:
                    simple_logger_1.logger.debug(`Received message from ${clientId}:`, message.type);
                // Handle other message types here
            }
        }
        catch (error) {
            simple_logger_1.logger.error(`Error handling message from ${clientId}:`, error);
            this.sendError(clientId, 'Invalid message format');
        }
    }
    /**
     * Handle client ping
     * @param clientId - Client ID
     * @private
     */
    handlePing(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.lastPing = Date.now();
            client.isAlive = true;
            this.sendToClient(clientId, {
                type: WSMessageType.PONG,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Handle client pong response
     * @param clientId - Client ID
     * @private
     */
    handlePong(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.isAlive = true;
            client.lastPing = Date.now();
        }
    }
    /**
     * Handle client disconnect
     * @param clientId - Client ID
     * @private
     */
    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            this.clients.delete(clientId);
            simple_logger_1.logger.debug(`WebSocket client disconnected: ${clientId}`);
        }
    }
    /**
     * Handle connection error
     * @param clientId - Client ID
     * @param error - Error object
     * @private
     */
    handleError(clientId, error) {
        simple_logger_1.logger.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
    }
    /**
     * Send message to specific client
     * @param clientId - Client ID
     * @param message - Message to send
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === ws_1.default.OPEN) {
            try {
                const messageWithTimestamp = {
                    ...message,
                    timestamp: message.timestamp || Date.now()
                };
                client.ws.send(JSON.stringify(messageWithTimestamp));
            }
            catch (error) {
                simple_logger_1.logger.error(`Error sending message to client ${clientId}:`, error);
                this.handleDisconnect(clientId);
            }
        }
    }
    /**
     * Broadcast message to all connected clients
     * @param message - Message to broadcast
     * @param excludeClient - Optional client ID to exclude
     */
    broadcast(message, excludeClient) {
        const messageWithTimestamp = {
            ...message,
            timestamp: message.timestamp || Date.now()
        };
        for (const [clientId, client] of this.clients) {
            if (clientId !== excludeClient && client.ws.readyState === ws_1.default.OPEN) {
                try {
                    client.ws.send(JSON.stringify(messageWithTimestamp));
                }
                catch (error) {
                    simple_logger_1.logger.error(`Error broadcasting to client ${clientId}:`, error);
                    this.handleDisconnect(clientId);
                }
            }
        }
    }
    /**
     * Send error message to client
     * @param clientId - Client ID
     * @param errorMessage - Error message
     * @private
     */
    sendError(clientId, errorMessage) {
        this.sendToClient(clientId, {
            type: WSMessageType.ERROR,
            data: { message: errorMessage },
            timestamp: Date.now()
        });
    }
    /**
     * Set up heartbeat mechanism to detect dead connections
     * @private
     */
    setupHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            const timeout = 30000; // 30 seconds
            for (const [clientId, client] of this.clients) {
                if (!client.isAlive || (now - client.lastPing) > timeout) {
                    simple_logger_1.logger.debug(`Terminating inactive client: ${clientId}`);
                    client.ws.terminate();
                    this.clients.delete(clientId);
                }
                else {
                    client.isAlive = false;
                    if (client.ws.readyState === ws_1.default.OPEN) {
                        client.ws.ping();
                    }
                }
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Generate unique client ID
     * @returns Unique client ID
     * @private
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.clients.size;
    }
    /**
     * Get client information
     */
    getClientInfo() {
        return Array.from(this.clients.values()).map(client => ({
            id: client.id,
            userId: client.userId,
            subscriptions: Array.from(client.subscriptions)
        }));
    }
    /**
     * Cleanup and close WebSocket server
     */
    close() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.wss) {
            this.wss.close(() => {
                simple_logger_1.logger.info('✅ WebSocket server closed');
            });
        }
        // Close all client connections
        for (const client of this.clients.values()) {
            client.ws.terminate();
        }
        this.clients.clear();
    }
}
/**
 * Global WebSocket service instance
 */
const webSocketService = new WebSocketService();
exports.webSocketService = webSocketService;
/**
 * Initialize WebSocket server
 * @param httpServer - HTTP server instance
 */
function setupWebSocket(httpServer) {
    webSocketService.initialize(httpServer);
}
/**
 * Send message to specific client
 */
function sendToClient(clientId, message) {
    webSocketService.sendToClient(clientId, message);
}
/**
 * Broadcast message to all clients
 */
function broadcast(message, excludeClient) {
    webSocketService.broadcast(message, excludeClient);
}
/**
 * Get WebSocket service statistics
 */
function getWebSocketStats() {
    return {
        connectedClients: webSocketService.getConnectedClientsCount(),
        clients: webSocketService.getClientInfo()
    };
}
exports.default = webSocketService;
//# sourceMappingURL=websocket-service.js.map