import * as fs from 'fs';
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
    origin: ['http://localhost:5173', 'http://localhost:5174'],
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
      const { userId } = socket.handshake.auth;

      if (userId) {
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
      if (messageDto.sender === messageDto.receiverId) return;
      // Обработка файлов (если есть)
      if (messageDto.files && messageDto.files.length > 0) {
        const files = JSON.parse(messageDto.files);
        for (const file of files) {
          // Логика сохранения файла на сервере
          if (file.size > 5 * 1024 * 1024) {
            throw new HttpException(
              `Файл ${file.name} превышает допустимый размер 5 МБ.`,
              HttpStatus.BAD_REQUEST,
            );
          }
          const filePath = `uploads/${Date.now()}_${file.name}`;
          await fs.promises.writeFile(
            filePath,
            Buffer.from(file.data, 'base64'),
          );
          file.path = filePath; // Добавляем путь файла
        }
        messageDto.files = JSON.stringify(files);
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('allMessage')
  async handleAllMessage(
    @MessageBody() payload: { sender: number; receiver: number },
  ) {
    try {
      if (payload.sender === payload.receiver) {
        return;
      }
      const messagesByParticipants =
        await this.messageService.getMessagesByParticipants(
          payload.receiver,
          payload.sender,
        );

      for (const client of this.clients) {
        if (client.user === payload.sender) {
          this.server.to(client.id).emit('allMessage', messagesByParticipants);
        }
      }
    } catch (error) {
      console.error('handleMessage error: ', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('markAllMessagesAsRead')
  async handleMarkAllMessagesAsRead(
    @MessageBody()
    payload: {
      userId: number;
    },
  ) {
    if (payload.userId) {
      await this.messageService.markAllMessagesAsRead(payload.userId);

      const unReadMessagesCount = await this.messageService.unReadCount(
        payload.userId,
      );

      for (const client of this.clients) {
        if (client.user === payload.userId) {
          this.server
            .to(client.id)
            .emit('unReadMessagesCount', unReadMessagesCount);
        }
      }
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
