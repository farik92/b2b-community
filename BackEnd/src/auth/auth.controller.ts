import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/users/users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService) {}
  @ApiBearerAuth()
  @Get('/verify')
  @UseGuards(AuthGuard)
  verifyUser(@Req() req: Request) {
    return this.usersService.getUser(req['user'].id);
  }
}
