import {
    BadRequestException,
    HttpException,
    Injectable,
    NestInterceptor,
    CallHandler,
    ExecutionContext,
    InternalServerErrorException,
    UnauthorizedException,
  } from "@nestjs/common";
  import { validate } from "class-validator";
  import { Observable } from "rxjs";
  import { ConfigService } from '@nestjs/config';
  import * as jwt from 'jsonwebtoken';
  
  @Injectable()
  export class Validator implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Promise<Observable<any>> {
      try {
        const request = context.switchToHttp().getRequest();
        const errors = await validate(request.body);
  
        if (errors.length > 0) {
          throw new BadRequestException(errors);
        }
  
        return next.handle();
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorException(error);
      }
    }
  }
  
  @Injectable()
  export class AuthTokenGuard implements NestInterceptor {
    constructor(private config: ConfigService) {}

    intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('No token provided');

      const [scheme, token] = authHeader.split(' ');
      if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token format');

      try {
        const secret = this.config.get<string>('JWT_SECRET');
        const payload = jwt.verify(token, secret as string);
        // attach decoded payload to request for downstream handlers
        req.user = payload as any;
        return next.handle();
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
  