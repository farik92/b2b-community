import { ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/messages.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto, finalReceiverDto } from './dto/messages.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async getAllMessages(req: Request) {
    try {
      const { id } = req['user'];
      const authUserMessages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .where('(message.sender = :id) OR (message.receiverId = :id)', {
          id,
        })
        .orderBy('message.message_ID', 'ASC')
        .getMany();
      const authUserRoomsMessages = authUserMessages.filter(
        (element) => element.type === 'room',
      );
      const promises = authUserRoomsMessages.map((message) => {
        if (message.receiverId) {
          return this.messageRepository.find({
            relations: ['sender'],
            where: { receiverId: message.receiverId },
          });
        } else {
          return Promise.resolve(undefined);
        }
      });
      const results = await Promise.all(promises);
      const finalAuthUserRoomsMessages = results
        .filter((result) => result !== undefined)
        .flat();
      const finalAuthUserMessages = authUserMessages.filter(
        (message) =>
          !authUserRoomsMessages.some(
            (authUserRoomsMessage) =>
              authUserRoomsMessage.receiverId === message.receiverId,
          ),
      );
      return [...finalAuthUserMessages, ...finalAuthUserRoomsMessages];
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllMessagesByUserId(id: number) {
    try {
      const authUserMessages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .where('(message.sender = :id) OR (message.receiverId = :id)', {
          id,
        })
        .orderBy('message.message_ID', 'ASC')
        .getMany();
      const authUserRoomsMessages = authUserMessages.filter(
        (element) => element.type === 'room',
      );
      const promises = authUserRoomsMessages.map((message) => {
        if (message.receiverId) {
          return this.messageRepository.find({
            relations: ['sender'],
            where: { receiverId: message.receiverId },
          });
        } else {
          return Promise.resolve(undefined);
        }
      });
      const results = await Promise.all(promises);
      const finalAuthUserRoomsMessages = results
        .filter((result) => result !== undefined)
        .flat();
      const finalAuthUserMessages = authUserMessages.filter(
        (message) =>
          !authUserRoomsMessages.some(
            (authUserRoomsMessage) =>
              authUserRoomsMessage.receiverId === message.receiverId,
          ),
      );
      return [...finalAuthUserMessages, ...finalAuthUserRoomsMessages];
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMessagesByReceiver(req: Request, receiver: finalReceiverDto) {
    try {
      if (typeof receiver.data === 'object') {
        return await this.messageRepository.find({
          relations: ['sender'],
          where: { receiverId: receiver.id },
        });
      } else {
        const user = req['user'];
        if (!user)
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const receiverUser = await this.usersService.getUser(receiver.id);
        if (!receiverUser)
          throw new HttpException('Receiver not found', HttpStatus.NOT_FOUND);
        const user1Id = user.id;
        const user2Id = receiverUser.id;
        return await this.messageRepository
          .createQueryBuilder('message')
          .leftJoinAndSelect('message.sender', 'sender')
          .where(
            '(message.sender = :user1Id AND message.receiverId = :user2Id) OR (message.sender = :user2Id AND message.receiverId = :user1Id)',
            { user1Id, user2Id },
          )
          .orderBy('message.message_ID', 'ASC')
          .getMany();
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async postMessage(newMessage: CreateMessageDto) {
    try {
      const newMessageCreated = this.messageRepository.create(newMessage);
      //console.log(newMessageCreated);
      return this.messageRepository.save(newMessageCreated);
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markMessagesAsSeen(message_ID: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isSeen: true })
      .where('message_ID = :message_ID AND isSeen = false', { message_ID })
      .execute();
  }

  async markMessagesAsRead(message_ID: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('message_ID = :message_ID AND isRead = false', { message_ID })
      .execute();
  }

  async unReadCount(receiverId: any) {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where('receiverId = :receiverId AND isRead = false', { receiverId })
      .getCount();
  }
}
