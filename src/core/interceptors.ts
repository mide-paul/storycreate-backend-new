import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from "@nestjs/common";
  
  import { Observable } from "rxjs";
  import { map } from "rxjs/operators";
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      console.log("Before...");
  
      const now = Date.now();
      return next.handle().pipe(
        map((data) => {
          console.log(`After... ${Date.now() - now}ms`);
          return data;
        }),
      );
    }
  }
  