import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    Req,
    // BadRequestException,
  } from "@nestjs/common";
  import { UserService } from "./user.service";
  import { CreateUserDto } from "./dto/create-user.dto";
  import { UpdateUserDto } from "./dto/update-user.dto";
  import { AuthTokenGuard, Validator } from "src/interceptors/validator";
  import { Request } from "express";
  import { AuthUserDto } from './dto/auth-user.dto';
  import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
//   import { PaymentService } from "src/payment/payment.service";
  
  @Controller("users")
  export class UserController {
    constructor(
      private readonly userService: UserService,
    //   private readonly paymentService: PaymentService,
    ) {}
  
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
      return this.userService.create(createUserDto);
    }
  
    @Post("login")
    login(@Body() loginDto: AuthUserDto) {
      return this.userService.login(loginDto);
    }
  
    @Get("profile")
    @UseInterceptors(AuthTokenGuard)
    async getProfile(
      @Req() req: Request & { user: { id: string } }
    ) {
      return await this.userService.getProfileByUserId(req.user.id);
    }
  
    @Patch("profile")
    @UseInterceptors(Validator)
    @UseInterceptors(AuthTokenGuard)
    async updateProfile(
      @Req() req: Request & { user: { id: string } },
      @Body() updateUserProfileDto: UpdateUserProfileDto,
    ) {
      const updated = await this.userService.updateProfileByUserId(
        req.user.id,
        updateUserProfileDto,
      );
      return {
        message: 'Profile updated successfully',
        data: updated,
      };
    }
  
    @Get()
    @UseInterceptors(AuthTokenGuard)
    async getAll(@Req() req: Request) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      return await this.userService.getAll(token);
    }
  
    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.userService.findOne(id);
    }
  
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.userService.update(id, updateUserDto);
    }
  
    @Delete(":id")
    @UseInterceptors(AuthTokenGuard)
    async remove(@Req() req: Request, @Param("id") id: string) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      return await this.userService.remove(id);
    }
  
    @Get("user-payments")
    @UseInterceptors(Validator)
    @UseInterceptors(AuthTokenGuard)
    async getUserPayments(@Req() request: Request) {
      const token = request.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      const user = await this.userService.getUserFromToken(token);
    //   return this.paymentService.getUserPayments(user.id);
    }
  }
  