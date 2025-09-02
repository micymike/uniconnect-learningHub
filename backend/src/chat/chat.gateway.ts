import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (userId) {
        this.userSockets.set(userId, client.id);
        await this.chatService.updateUserStatus(userId, true);
        this.server.emit('userOnline', { userId });
      }
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries())
      .find(([, socketId]) => socketId === client.id)?.[0];
    
    if (userId) {
      this.userSockets.delete(userId);
      await this.chatService.updateUserStatus(userId, false);
      this.server.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { userId: string, otherUserId: string }, @ConnectedSocket() client: Socket) {
    const roomId = [data.userId, data.otherUserId].sort().join('-');
    client.join(roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.chatService.sendMessage(data.senderId, {
        receiverId: data.receiverId,
        content: data.content,
      });

      const roomId = [data.senderId, data.receiverId].sort().join('-');
      this.server.to(roomId).emit('newMessage', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(@MessageBody() data: { senderId: string, receiverId: string, isTyping: boolean }) {
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: data.senderId,
        isTyping: data.isTyping,
      });
    }
    
    await this.chatService.updateUserStatus(data.senderId, true, data.isTyping, data.receiverId);
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(@MessageBody() data: { messageId: string, userId: string, content: string }) {
    try {
      const message = await this.chatService.editMessage(data.messageId, data.userId, {
        content: data.content,
      });
      
      this.server.emit('messageEdited', message);
    } catch (error) {
      this.server.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody() data: { messageId: string, userId: string }) {
    try {
      await this.chatService.deleteMessage(data.messageId, data.userId);
      this.server.emit('messageDeleted', { messageId: data.messageId });
    } catch (error) {
      this.server.emit('error', { message: error.message });
    }
  }
}