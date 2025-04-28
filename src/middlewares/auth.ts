// import {
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from "@nestjs/common";
// import { NextFunction, Request, Response } from "express";
// import { Users } from "src/user/entities/user.entity";
// import { Repository } from "typeorm";
// import { InjectRepository } from "@nestjs/typeorm";
// import { ConfigService } from "@nestjs/config";
// import * as jwt from "jsonwebtoken";

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(
//     @InjectRepository(Users)
//     private creatorRepository: Repository<Users>,
//     private config: ConfigService,
//   ) {}

//   async use(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       // Check for authorization header
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         throw new UnauthorizedException(
//           "Authorization header missing or malformed",
//         );
//       }

//       // Extract and verify the token
//       const token = authHeader.split(" ")[1];
//       const decodedData: any = jwt.verify(
//         token,
//         this.config.getOrThrow("JWT_SECRET"),
//       );
//       const creatorId = decodedData.id;
//       console.log(creatorId);

//       // Find the creator and include the associated user
//       const creator = await this.creatorRepository.findOne({
//         where: { id: creatorId },
//       });

//       if (!creator || !creator.user.user) {
//         throw new UnauthorizedException("Invalid token or user not found");
//       }

//       // Attach the user's ID to the request object
//       req.user = creator.user.user.id;

//       // Proceed to the next middleware
//       next();
//     } catch (error) {
//       console.error("AuthMiddleware error:", error.message);
//       throw new UnauthorizedException(
//         "Authentication failed. Please check your credentials.",
//       );
//     }
//   }
// }
