import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, finalReceiverDto } from './dto/messages.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebSocketsGateway } from '../socket/websockets.gateway';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private socketServer: WebSocketsGateway,
  ) {}
  @Get('/getAll')
  getAllMessagesEndpoint(@Request() req: Request) {
    return this.messagesService.getAllMessages(req);
  }
  @Post('/getByReceiver')
  getMessagesByReceiverEndpoint(
    @Body() finalReceiver: finalReceiverDto,
    @Request() req: Request,
  ) {
    return this.messagesService.getMessagesByReceiver(req, finalReceiver);
  }
  @Post('/post')
  async createMessageEndpoint(@Body() newMessage: CreateMessageDto) {
    //return this.messagesService.postMessage(newMessage);
    //this.socketServer.clients.map((c) => c.socket.handshake.auth.userId);
    this.socketServer.clients
      .filter((s) => s.user === newMessage.receiverId)
      .forEach((s) =>
        s.socket.emit('message', {
          ...newMessage,
          type: 'user',
          sender: { id: newMessage.sender },
        }),
      );
    return this.messagesService.postMessage(newMessage);
  }
  @Post('read')
  markMessageAsRead(
    @Body('id') id: number,
    @Body('senderId') senderId: number,
  ) {
    return this.messagesService.markMessageAsRead(id, senderId);
  }

  @Get('test')
  test() {
    return this.socketServer.test();
  }
}
