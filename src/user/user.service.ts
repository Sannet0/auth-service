import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import * as passwordHash from 'password-hash';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async userInfo(req: any): Promise<{ id: string; login: string; }> {
    const { id, login } = req.user;
    return { id, login };
  }

  async registration(user: { login: string; password: string; repPassword: string }): Promise<{ jwt: string }> {
    const { login, password, repPassword } = user;
    try {
      if (password !== repPassword) {
        throw new HttpException('password and repPassword not same', HttpStatus.BAD_REQUEST);
      }

      const hash = passwordHash.generate(password);

      const createdUsers: User[] = await this.userRepository.query(`
        INSERT INTO Users ("login", "password") 
        VALUES ('${ login }', '${ hash }') 
        RETURNING id, "login"
      `);
      const newUser: User = createdUsers[0];

      if (newUser === undefined) {
        throw new HttpException('bad request', HttpStatus.BAD_REQUEST);
      }

      const payload = { id: newUser.id, login: newUser.login };
      return {
        jwt: this.jwtService.sign(payload, { expiresIn: '24h' })
      };
    } catch (err) {
      throw new HttpException(err.detail || err.response || 'something wrong', HttpStatus.BAD_REQUEST);
    }
  }

  async login(user: { login: string; password: string }): Promise<{ jwt: string }> {
    const { login, password } = user;
    try {
      const user = await this.userRepository.query(`
        SELECT * FROM Users
        WHERE "login" = '${ login }'
      `);
      const accurateUser = user[0];

      if (accurateUser === undefined) {
        throw new HttpException('no such user', HttpStatus.BAD_REQUEST);
      }

      const isPasswordCorrect = passwordHash.verify(password, accurateUser.password);

      if (isPasswordCorrect) {
        const payload = { id: accurateUser.id, login: accurateUser.login };
        return {
          jwt: this.jwtService.sign(payload, { expiresIn: '24h' })
        };
      }

      throw new HttpException('password or email not right', HttpStatus.BAD_REQUEST);
    } catch (err) {
      throw new HttpException(err.detail || err.response || 'something wrong', HttpStatus.BAD_REQUEST);
    }
  }
}
