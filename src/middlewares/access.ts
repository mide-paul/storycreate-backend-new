// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   InternalServerErrorException,
// } from "@nestjs/common";
// import { AccessLevel } from "src/core/enums";
// import { UserService } from "src/user/user.service";

// @Injectable()
// export class AccessGuard implements CanActivate {
//   private accessLevel: AccessLevel;

//   constructor(accessLevel: AccessLevel) {
//     this.accessLevel = accessLevel;
//   }
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       const token = context
//         .switchToHttp()
//         .getRequest()
//         .headers.authorization.split(" ")[1];

//       // const isValid = await this.userService.validate(token, this.accessLevel);

//       // return isValid.isValid;
//       return false;
//     } catch (error) {
//       throw new InternalServerErrorException(error);
//     }
//   }
//   use(req, res, next) {
//     console.log("AccessMiddleware");
//     next();
//   }
// }
