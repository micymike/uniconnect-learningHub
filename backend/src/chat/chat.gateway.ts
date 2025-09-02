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
        // Only emit to specific users who need to know, not everyone
        client.broadcast.emit('userOnline', { userId });
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
      client.broadcast.emit('userOffline', { userId });
    }
  }



  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.chatService.sendMessage(data.senderId, {
        receiverId: data.receiverId,
        content: data.content,
      });

      // Send to sender
      client.emit('newMessage', message);
      
      // Send to receiver if online
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
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
  async handleEditMessage(@MessageBody() data: { messageId: string, userId: string, content: string }, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.chatService.editMessage(data.messageId, data.userId, {
        content: data.content,
      });

      // Send to sender
      client.emit('messageEdited', message);
      
      // Send to receiver if online
      const receiverSocketId = this.userSockets.get(message.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('messageEdited', message);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody() data: { messageId: string, userId: string, receiverId: string }, @ConnectedSocket() client: Socket) {
    try {
      await this.chatService.deleteMessage(data.messageId, data.userId);
      
      // Send to sender
      client.emit('messageDeleted', { messageId: data.messageId });
      
      // Send to receiver if online
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('messageDeleted', { messageId: data.messageId });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
