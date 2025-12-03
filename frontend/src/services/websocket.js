import { io } from "socket.io-client";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found, cannot connect to WebSocket");
      return;
    }

    this.socket = io("http://localhost:5000", {
      auth: {
        token: token,
      },
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on("new_notification", callback);
    }
  }

  // Remove notification listener
  offNewNotification() {
    if (this.socket) {
      this.socket.off("new_notification");
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
