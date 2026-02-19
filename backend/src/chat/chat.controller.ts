import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService} from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto, EditMessageDto, AddStudyMateDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  @Get('messages/:otherUserId')
  async getMessages(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(req.user.userId, otherUserId, limit);
  }

  @Put('messages/:messageId')
  async editMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.chatService.editMessage(messageId, req.user.userId, dto);
  }

  @Delete('messages/:messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(messageId, req.user.userId);
  }

  @Post('study-mates')
  async addStudyMate(@Request() req, @Body() dto: AddStudyMateDto) {
    return this.chatService.addStudyMate(req.user.userId, dto);
  }

  @Get('study-mates')
  async getStudyMates(@Request() req) {
    return this.chatService.getStudyMates(req.user.userId);
  }

  @Get('search-users')
  async searchOnlineUsers(@Request() req, @Query('q') query: string) {
    return this.chatService.searchOnlineUsers(req.user.userId, query);
  }

  @Get('available-users')
  async getAvailableUsers(@Request() req) {
    return this.chatService.getAvailableUsers();
  }

  @Post('status')
  async updateStatus(
    @Request() req,
    @Body() body: { isOnline: boolean; isTyping?: boolean; typingTo?: string },
  ) {
    return this.chatService.updateUserStatus(
      req.user.userId,
      body.isOnline,
      body.isTyping,
      body.typingTo,
    );
  }

  @Get('test')
  async testConnection() {
    return { message: 'Chat service is working', timestamp: new Date() };
  }
}
