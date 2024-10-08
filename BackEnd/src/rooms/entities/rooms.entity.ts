import { User } from 'src/users/entities/users.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn()
  room_ID: number;
  @Column()
  name: string;
  @ManyToOne(() => User, (user) => user.id)
  creator: number;
  @ManyToOne(() => User, (user) => user.id)
  member: number;
  @Column()
  image: string;
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
