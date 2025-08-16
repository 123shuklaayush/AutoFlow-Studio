/**
 * @fileoverview WebSocket service for real-time communication
 * @author Ayush Shukla
 * @description WebSocket server for real-time workflow execution updates
 */

import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';
import { logger } from '../utils/simple-logger';

/**
 * WebSocket message types
 */
export enum WSMessageType {
  // Connection management
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',

  // Workflow execution events
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_STEP = 'execution_step',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_FAILED = 'execution_failed',
  EXECUTION_PAUSED = 'execution_paused',

  // Recording events
  RECORDING_STARTED = 'recording_started',
  RECORDING_STEP = 'recording_step',
  RECORDING_STOPPED = 'recording_stopped',

  // Compilation events
  COMPILATION_PROGRESS = 'compilation_progress',
  COMPILATION_COMPLETED = 'compilation_completed',

  // System events
  SYSTEM_STATUS = 'system_status',
  ERROR = 'error'
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
 * Connected client interface
 */
interface ConnectedClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

/**
 * WebSocket service class
 */
class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   * @param httpServer - HTTP server instance
   */
  initialize(httpServer: HTTPServer): void {
    try {
      this.wss = new WebSocket.Server({ 
        server: httpServer,
        path: '/ws',
        verifyClient: this.verifyClient.bind(this)
      });

      this.wss.on('connection', this.handleConnection.bind(this));
      this.setupHeartbeat();

      logger.info('✅ WebSocket server initialized on /ws');

    } catch (error) {
      logger.error('❌ Failed to initialize WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Verify client connection (authentication can be added here)
   * @param info - Connection info
   * @returns Whether client is allowed to connect
   * @private
   */
  private verifyClient(info: { req: any }): boolean {
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
  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    
    const client: ConnectedClient = {
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

    logger.debug(`WebSocket client connected: ${clientId}`);
  }

  /**
   * Handle incoming message from client
   * @param clientId - Client ID
   * @param data - Message data
   * @private
   */
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case WSMessageType.PING:
          this.handlePing(clientId);
          break;

        case WSMessageType.DISCONNECT:
          this.handleDisconnect(clientId);
          break;

        default:
          logger.debug(`Received message from ${clientId}:`, message.type);
          // Handle other message types here
      }

    } catch (error) {
      logger.error(`Error handling message from ${clientId}:`, error);
      this.sendError(clientId, 'Invalid message format');
    }
  }

  /**
   * Handle client ping
   * @param clientId - Client ID
   * @private
   */
  private handlePing(clientId: string): void {
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
  private handlePong(clientId: string): void {
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
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      logger.debug(`WebSocket client disconnected: ${clientId}`);
    }
  }

  /**
   * Handle connection error
   * @param clientId - Client ID
   * @param error - Error object
   * @private
   */
  private handleError(clientId: string, error: Error): void {
    logger.error(`WebSocket error for client ${clientId}:`, error);
    this.handleDisconnect(clientId);
  }

  /**
   * Send message to specific client
   * @param clientId - Client ID
   * @param message - Message to send
   */
  sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: message.timestamp || Date.now()
        };
        
        client.ws.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        logger.error(`Error sending message to client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   * @param message - Message to broadcast
   * @param excludeClient - Optional client ID to exclude
   */
  broadcast(message: WSMessage, excludeClient?: string): void {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now()
    };

    for (const [clientId, client] of this.clients) {
      if (clientId !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(messageWithTimestamp));
        } catch (error) {
          logger.error(`Error broadcasting to client ${clientId}:`, error);
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
  private sendError(clientId: string, errorMessage: string): void {
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
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds

      for (const [clientId, client] of this.clients) {
        if (!client.isAlive || (now - client.lastPing) > timeout) {
          logger.debug(`Terminating inactive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
        } else {
          client.isAlive = false;
          if (client.ws.readyState === WebSocket.OPEN) {
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
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get client information
   */
  getClientInfo(): Array<{ id: string; userId?: string; subscriptions: string[] }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      userId: client.userId,
      subscriptions: Array.from(client.subscriptions)
    }));
  }

  /**
   * Cleanup and close WebSocket server
   */
  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wss) {
      this.wss.close(() => {
        logger.info('✅ WebSocket server closed');
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

/**
 * Initialize WebSocket server
 * @param httpServer - HTTP server instance
 */
export function setupWebSocket(httpServer: HTTPServer): void {
  webSocketService.initialize(httpServer);
}

/**
 * Send message to specific client
 */
export function sendToClient(clientId: string, message: WSMessage): void {
  webSocketService.sendToClient(clientId, message);
}

/**
 * Broadcast message to all clients
 */
export function broadcast(message: WSMessage, excludeClient?: string): void {
  webSocketService.broadcast(message, excludeClient);
}

/**
 * Get WebSocket service statistics
 */
export function getWebSocketStats() {
  return {
    connectedClients: webSocketService.getConnectedClientsCount(),
    clients: webSocketService.getClientInfo()
  };
}

/**
 * Export WebSocket service
 */
export { webSocketService };
export default webSocketService;
