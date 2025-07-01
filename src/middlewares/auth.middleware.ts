import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Authorization header missing or malformed');
      }

      const token = authHeader.split(' ')[1];
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const decoded: any = jwt.verify(token, secret);
      if (!decoded || (!decoded.id && !decoded.userId)) {
        throw new UnauthorizedException('Invalid token');
      }

      const userId = decoded.id || decoded.userId;

      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
