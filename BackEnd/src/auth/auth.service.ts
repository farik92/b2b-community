import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { LoginUserDto, RegisterUserDto } from '../users/dto/users.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async signUp(res: Response, newUser: RegisterUserDto) {
    try {
      const { email, password } = newUser;
      const findEmail = await this.userRepository.findOne({ where: { email } });
      if (findEmail)
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      const hashedPassword = await bcrypt.hash(password, 10);
      const userCreated = this.userRepository.create({
        ...newUser,
        password: hashedPassword,
      });
      const userSaved = await this.userRepository.save(userCreated);
      const payload = { id: userSaved.id };
      const UserToken = await this.jwtService.signAsync(payload);
      res.status(201).json({ user: userSaved, token: UserToken });
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signIn(res: Response, user: LoginUserDto) {
    try {
      const { username, password } = user;
      const findUser = await this.userRepository.findOne({
        where: { username },
      });
      if (!findUser)
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      const chAlpha = (hash: string) => {
        return hash.substring(0, 2) + 'b' + hash.substring(3);
      };
      console.log(findUser.password);
      const isMatch = await bcrypt.compare(
        password,
        chAlpha(findUser.password),
      );
      if (!isMatch)
        throw new HttpException('Incorrect Password', HttpStatus.BAD_REQUEST);
      const payload = { id: findUser.id };
      const UserToken = await this.jwtService.signAsync(payload);
      res.status(200).json({ user: findUser, token: UserToken });
      console.log(UserToken);
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signOut(res: Response) {
    try {
      res.status(200).json({ message: 'Disconnected' });
    } catch (error) {
      console.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
