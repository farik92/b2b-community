import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 999, description: 'ID отправителя' })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  sender: number;
  @ApiProperty({ example: 'текст', description: 'Текст сообщения' })
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty({ example: 998, description: 'ID получателя' })
  @IsNumber()
  @IsPositive()
  receiverId: number;
  @IsOptional()
  @IsString()
  type?: string;
  @ApiProperty({
    example: 'market',
    description: 'Источник (название поддомена)',
  })
  @IsOptional()
  @IsString()
  source?: string;
  @ApiProperty({ example: 998, description: 'ID ресурса' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  itemId?: number;
  @ApiProperty({ example: 998, description: 'ID категории ресурса' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  itemCat?: number;
  @ApiProperty({ example: 998, description: 'ID склада ресурса' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  itemWarehouse?: number;
  @IsOptional()
  @IsString()
  files?: string;
}

export interface finalReceiverDto {
  id: number;
  data: number[] | undefined;
}
