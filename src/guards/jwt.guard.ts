import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader: string[] = req.headers.authorization.split(' ');
      const type: string = authHeader[0];
      const token: string = authHeader[1];
      req.user = this.jwtService.verify(token);

      return type === 'Bearer';
    } catch (err) {
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
