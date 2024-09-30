import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('/getAll')
  getAllUsersEndpoint() {
    return this.userService.getAllUsers();
  }
  @Get('/get/:id')
  getUserEndpoint(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }
  @Get('/id/get/:name')
  getUserByNameEndpoint(@Param() name: string) {
    return this.userService.getUserByName(name);
  }
  @Put('/put/:id')
  putUserEndpoint(
    @Body() data: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.putUserById(id, data);
  }
}
