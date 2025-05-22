import { Server, Socket } from "socket.io";

type EntityID = number;

interface ClientInfo {
  socket: Socket;
  entityId: EntityID;
}

export class SocketManager {
  private clients: Map<string, ClientInfo> = new Map(); // socket.id -> ClientInfo
  private entityToSocket: Map<EntityID, string> = new Map(); // entityId -> socket.id

  constructor(private io: Server) {
    this.io.on("connection", (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    console.log(`[+] Client connected: ${socket.id}`);

    // Dummy: Oyuncuya yeni bir entity atanıyor.
    const entityId = this.generateEntityForSocket(socket);

    this.clients.set(socket.id, { socket, entityId });
    this.entityToSocket.set(entityId, socket.id);

    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("player_input", (data) => this.handleInput(socket, data));
  }

  private handleDisconnect(socket: Socket) {
    const info = this.clients.get(socket.id);
    if (info) {
      console.log(`[-] Client disconnected: ${socket.id} (Entity ${info.entityId})`);
      this.entityToSocket.delete(info.entityId);
    }
    this.clients.delete(socket.id);
  }

  private handleInput(socket: Socket, data: any) {
    const client = this.clients.get(socket.id);
    if (!client) return;

    // Girdiyi ECS sistemlerine paslayabilirsin:
    // örneğin MovementSystem.handleInput(client.entityId, data)
    console.log(`[>] Input from ${client.entityId}:`, data);
  }

  private generateEntityForSocket(socket: Socket): EntityID {
    // Burada yeni bir entity oluşturup, world'e ekleyebilirsin
    // Şimdilik basit bir ID üretimi simülasyonu:
    return Date.now(); // ya da gerçek bir EntityManager'dan ID al
  }

  /** Entity'ye bağlı soketi al */
  getSocketByEntity(entityId: EntityID): Socket | null {
    const socketId = this.entityToSocket.get(entityId);
    return socketId ? this.clients.get(socketId)?.socket || null : null;
  }

  /** Belirli bir entity'ye mesaj gönder */
  emitToEntity(entityId: EntityID, event: string, payload: any) {
    const socket = this.getSocketByEntity(entityId);
    if (socket) {
      socket.emit(event, payload);
    }
  }

  /** Gerekirse herkese broadcast */
  broadcast(event: string, payload: any) {
    this.io.emit(event, payload);
  }
}
