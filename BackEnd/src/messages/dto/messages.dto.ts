import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  sender: number;
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  receiverId: number;
  @IsNotEmpty()
  @IsString()
  type: string;
}

export interface finalReceiverDto {
  id: number;
  data: number[] | undefined;
}
