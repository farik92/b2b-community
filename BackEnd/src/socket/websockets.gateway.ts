import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { ClientDto } from './dto/websockets.dto';
import { UsersService } from 'src/users/users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateMessageDto } from '../messages/dto/messages.dto';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'https://market.b2b-se.com',
      'https://b2b-se.com',
      'https://site.b2b-se.com',
      'https://b2b-se.com',
    ],
  },
})
export class WebSocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private messageService: MessagesService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer() server: Server;
  public clients: ClientDto[] = [];
  private usersHandle: any[] = [];

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const { userId, token } = socket.handshake.auth;
      if (!token) return;
      const { id: secureUserId } = await this.jwtService.verifyAsync(token, {
        secret: process.env.TOKEN_SECURE,
      });

      if (secureUserId === userId) {
        this.clients.push({
          user: userId,
          id: socket.id,
          socket,
        });
        if (!this.usersHandle.includes(userId)) this.usersHandle.push(userId);
        this.server.emit('getOnlineUsers', this.usersHandle);

        const unReadMessagesCount =
          await this.messageService.unReadCount(userId);
        socket.emit('unReadMessagesCount', unReadMessagesCount);
      }
    } catch (error) {
      console.log(error);
      //throw error;
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const { userId } = socket.handshake.auth;
      if (userId) {
        this.clients = this.clients.filter((client) => client.id !== socket.id);
        const user = await this.usersService.getUser(userId);
        this.usersHandle = this.usersHandle.filter((name) => name !== user.id);
        this.server.emit('getOnlineUsers', this.usersHandle);
      }
    } catch (error) {
      console.error('handleDisconnect error', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() messageDto: CreateMessageDto) {
    try {
      if (messageDto.sender === messageDto.receiverId) {
        return;
      }
      await this.messageService.postMessage({
        ...messageDto,
        type: 'user',
      });
      for (const client of this.clients) {
        if (client.user === messageDto.receiverId) {
          const senderUser = await this.usersService.getUser(messageDto.sender);
          this.server.to(client.id).emit('message', {
            ...messageDto,
            sender: senderUser,
            type: 'user',
          });

          const unReadMessagesCount = await this.messageService.unReadCount(
            messageDto.receiverId,
          );
          this.server
            .to(client.id)
            .emit('unReadMessagesCount', unReadMessagesCount);
        }
      }
    } catch (error) {
      console.error('handleMessage error: ', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody()
    payload: {
      userId: number;
      receiverId: number;
    },
  ) {
    if (payload.userId && payload.receiverId !== 0) {
      await this.messageService.markMessageAsRead(
        payload.receiverId,
        payload.userId,
      );
      const unReadMessagesCount = await this.messageService.unReadCount(
        payload.userId,
      );

      for (const client of this.clients) {
        if (client.user === payload.userId) {
          this.server.to(client.id).emit('markMessageAsRead', {
            receiverId: payload.userId,
          });
          this.server
            .to(client.id)
            .emit('unReadMessagesCount', unReadMessagesCount);
        }
      }
    }
  }

  @SubscribeMessage('removeChat')
  async handleRemoveChat(
    @MessageBody() payload: { userId: number; receiverId: number },
  ) {
    await this.messageService.deleteMessagesByParticipants(
      payload.receiverId,
      payload.userId,
    );

    for (const client of this.clients) {
      if (client.user === payload.receiverId) {
        this.server.to(client.id).emit('removeChat', {
          receiverId: payload.userId,
        });
      }
    }
  }
}
