import { Message } from 'src/messages/entities/messages.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({ name: 'x0u37_users' })
export class User {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Message, (message) => message.sender)
  id: number;
  @Column()
  name: string;
  @Column()
  username: string;
  @Column()
  email: string;
  @Column()
  password: string;
}
