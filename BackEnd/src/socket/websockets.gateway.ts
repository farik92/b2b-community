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
import { CreateRoomDto } from 'src/rooms/dto/rooms.dto';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
    private jwtService: JwtService,
  ) {}

  @WebSocketServer() server: Server;
  public clients: ClientDto[] = [];
  private usersHandle: any[] = [];

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const { userId, token } = socket.handshake.auth;
      if (!token) throw new UnauthorizedException('no token');
      const { id: secureUserId } = await this.jwtService.verifyAsync(token, {
        secret: process.env.TOKEN_SECURE,
      });

      if (secureUserId === userId) {
        console.log(`${userId} with id: ${socket.id} is connected `);
        /*this.clients.push({ user: userId, id: socket.id, socket });
                this.usersHandle = (await this.server.fetchSockets()).map(
                  (socket) => socket.handshake.auth.userId,
                );
                console.log('Users online: ', this.usersHandle);
                // if (!this.usersHandle.includes(userId)) this.usersHandle.push(userId);
                socket.emit('getOnlineUsers', this.usersHandle);*/

        this.clients.push({
          user: userId,
          id: socket.id,
          socket,
        });
        if (!this.usersHandle.includes(userId)) this.usersHandle.push(userId);
        this.server.emit('getOnlineUsers', this.usersHandle);
        console.log(this.usersHandle);

        const unReadMessagesCount =
          await this.messageService.unReadCount(userId);
        socket.emit('unReadMessagesCount', unReadMessagesCount);
      }
    } catch (error) {
      throw error;
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      console.log(socket.handshake.auth);
      const { userId } = socket.handshake.auth;
      if (userId) {
        console.log(`${userId} with id: ${socket.id} Disconnected `);
        /*this.clients = this.clients.filter((client) => client.id !== socket.id);
                const user = await this.usersService.getUser(userId);
                this.usersHandle = this.usersHandle.filter((name) => name !== user.id);
                socket.emit('getOnlineUsers', this.usersHandle);*/

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
      const { userId, receiverId } = socket.handshake.auth;
      const finalData = { sender: userId, content, receiverId };

      for (const client of this.clients) {
        if (client.user === receiverId) {
          const senderUser = await this.usersService.getUser(userId);
          this.server.to(client.id).emit('message', {
            ...finalData,
            sender: senderUser,
            type: 'user',
          });

          const unReadMessagesCount =
            await this.messageService.unReadCount(receiverId);
          this.server
            .to(client.id)
            .emit('unReadMessagesCount', unReadMessagesCount);
        }
      }
      await this.messageService.postMessage({
        ...finalData,
        type: 'user',
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
