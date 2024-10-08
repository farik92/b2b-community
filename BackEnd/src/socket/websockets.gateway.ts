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
import { RoomsService } from 'src/rooms/rooms.service';
import { CompleteRoomDto, CreateRoomDto } from 'src/rooms/dto/rooms.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://4b2b.loc', 'http://localhost:5173'],
  },
})
export class WebSocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private messageService: MessagesService,
    private usersService: UsersService,
    private roomsService: RoomsService,
  ) {}

  @WebSocketServer() server: Server;
  private clients: ClientDto[] = [];
  private usersHandle: any[] = [];

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const { userId, receiverId } = socket.handshake.auth;

      if (userId) {
        console.log(`${userId} with id: ${socket.id} is connected `);
        this.clients.push({ user: userId, id: socket.id, socket });
        if (!this.usersHandle.includes(userId)) this.usersHandle.push(userId);
        this.server.emit('getOnlineUsers', this.usersHandle);
        console.log(this.usersHandle);
        const unReadMessagesCount =
          await this.messageService.unReadCount(userId);
        this.server
          .to(socket.id)
          .emit('unReadMessagesCount', unReadMessagesCount);

        const unReadMessagesCountByChat =
          await this.messageService.unReadCountByChat(userId, receiverId);
        this.server
          .to(socket.id)
          .emit('unReadMessagesCountByChat', unReadMessagesCountByChat);

        const allMessages =
          await this.messageService.getAllMessagesByUserId(userId);
        this.server.to(socket.id).emit('allMessages', allMessages);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const { userId } = socket.handshake.auth;
      if (userId) {
        console.log(`${userId} with id: ${socket.id} Disconnected `);
        this.clients = this.clients.filter((client) => client.id !== socket.id);
        const user = await this.usersService.getUser(userId);
        this.usersHandle = this.usersHandle.filter((name) => name !== user.id);
        this.server.emit('getOnlineUsers', this.usersHandle);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() content: string,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      let room: CompleteRoomDto;
      const { userId, receiverId } = socket.handshake.auth;
      const finalData = { sender: userId, content, receiverId };

      const receiverUser = await this.usersService.getUser(receiverId); // si es un grupo no va a existir
      if (!receiverUser) {
        const [findRoom] = await this.roomsService.getRoomByName(receiverId);
        //nos aseguramos de que el receiver es el nombre de una room existente
        room = findRoom;
      }

      for (const client of this.clients) {
        if (receiverUser) {
          // es un user
          if (client.user === receiverUser.id) {
            const senderUser = await this.usersService.getUser(userId);
            this.server.to(client.id).emit('message', {
              ...finalData,
              sender: senderUser,
              type: 'user',
            });

            const unReadMessagesCount = await this.messageService.unReadCount(
              receiverUser.id,
            );
            this.server
              .to(client.id)
              .emit('unReadMessagesCount', unReadMessagesCount);

            const unReadMessagesCountByChat =
              await this.messageService.unReadCountByChat(
                receiverUser.id,
                userId,
              );
            this.server
              .to(client.id)
              .emit('unReadMessagesCountByChat', unReadMessagesCountByChat);
          }
        } else {
          // es una room
          for (const member of room.members) {
            if (client.user === member) {
              const senderUser = await this.usersService.getUser(userId);
              this.server.to(client.id).emit('message', {
                ...finalData,
                sender: senderUser,
                type: 'room',
              });

              const unReadMessagesCount =
                await this.messageService.unReadCount(userId);
              this.server
                .to(client.id)
                .emit('unReadMessagesCount', unReadMessagesCount);
            }
          }
        }
      }
      receiverUser
        ? await this.messageService.postMessage({
            ...finalData,
            type: 'user',
          })
        : await this.messageService.postMessage({
            ...finalData,
            type: 'room',
          });
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody()
    payload: {
      message_ID: number;
      roomId?: number;
      userId?: number;
    },
  ) {
    await this.messageService.markMessageAsRead(payload.message_ID);
    console.log(payload);
    if (payload.roomId) {
      this.server.to(`room_${payload.roomId}`).emit('markMessageAsRead', {
        message_ID: payload.message_ID,
      });
    }

    if (payload.userId) {
      const client = this.clients.find(
        (client) => client.user === payload.userId,
      );
      if (client) {
        this.server.to(client.id).emit('markMessageAsRead', {
          message_ID: payload.message_ID,
        });
      }
    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateRoomDto,
  ) {
    try {
      const { name, creator } = data;
      socket.join(name);
      console.log(`Client ${socket.id} create room ${name}`);
      this.roomsService.postRoom({ name, creator, members: [creator] });
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @SubscribeMessage('addClientToRoom')
  async handleAddClientToRoom(@MessageBody() data: CreateRoomDto) {
    try {
      const { name, creator, members } = data;
      members.forEach((member: number) => {
        this.clients.forEach(async (client: ClientDto) => {
          if (member === client.user) {
            client.socket.join(name);
            data.image;
            this.server.to(client.id).emit('addClientToRoom', {
              ...data,
              members: [...data.members, creator],
              image: data.url,
            });
            console.log(`Client ${member} joined room ${name}`);
          }
        });
      });
      this.roomsService.postRoom({ name, creator, members });
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async test() {
    console.log(
      [...(await this.server.allSockets())].map((s, i) =>
        this.server.to(s).emit('message', i + ' ' + s),
      ),
    );
  }
}
