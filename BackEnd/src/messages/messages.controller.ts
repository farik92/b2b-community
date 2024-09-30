import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Param,
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
  createMessageEndpoint(@Body() newMessage: CreateMessageDto) {
    //return this.messagesService.postMessage(newMessage);
    return this.messagesService.postMessage(newMessage);
  }
  @Post('read/:id')
  markMessagesAsRead(@Param('id') id: number) {
    return this.messagesService.markMessagesAsRead(id);
  }
  @Post('seen/:id')
  markMessagesAsSeen(@Param('id') id: number) {
    return this.messagesService.markMessagesAsSeen(id);
  }

  @Get('test')
  test() {
    return this.socketServer.test();
  }
}
