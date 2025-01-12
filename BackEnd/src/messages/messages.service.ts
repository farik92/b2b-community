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
      return await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .where('(message.sender = :id) OR (message.receiverId = :id)', {
          id,
        })
        .orderBy('message.message_ID', 'ASC')
        .getMany();
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

  async getMessagesByParticipants(receiverId: number, senderId: number) {
    try {
      const user1Id = senderId;
      const user2Id = receiverId;
      return await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .where(
          '(message.sender = :user1Id AND message.receiverId = :user2Id) OR (message.sender = :user2Id AND message.receiverId = :user1Id)',
          { user1Id, user2Id },
        )
        .orderBy('message.message_ID', 'ASC')
        .getMany();
    } catch (error) {
      console.log(error);
    }
  }

  async postMessage(newMessage: CreateMessageDto) {
    try {
      if (newMessage.sender === newMessage.receiverId) {
        return;
      }
      const newMessageCreated = this.messageRepository.create(newMessage);
      return this.messageRepository.save(newMessageCreated);
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markMessageAsRead(receiverId: number, senderId: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where(
        'receiverId = :senderId AND senderId = :receiverId AND isRead = false',
        { receiverId, senderId },
      )
      .execute();
  }

  async markAllMessagesAsRead(userId: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('receiverId = :userId AND isRead = false', { userId })
      .execute();
  }

  async unReadCount(receiverId: number) {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where('receiverId = :receiverId AND isRead = false', { receiverId })
      .getCount();
  }

  async unReadCountByChat(receiverId: number, senderId: number) {
    return await this.messageRepository
      .createQueryBuilder('message')
      .where(
        'receiverId = :receiverId AND senderId = :senderId AND isRead = false',
        { receiverId, senderId },
      )
      .getCount();
  }

  async deleteMessagesByParticipants(receiverId: number, senderId: number) {
    return this.messageRepository
      .createQueryBuilder('message')
      .delete()
      .where(
        '(receiverId = :receiverId AND senderId = :senderId) OR (receiverId = :senderId AND senderId = :receiverId)',
        {
          receiverId,
          senderId,
        },
      )
      .execute();
  }
}
