import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
    Matches,
    MinLength,
  } from "class-validator";
  
  const passwordRegEx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;
  
  export class CreateUserDto {
    @IsString()
    @MinLength(2, { message: "Firstname must have atleast 2 characters." })
    @IsNotEmpty()
    firstName: string;
  
    @IsString()
    @MinLength(2, { message: "Lastname must have atleast 2 characters." })
    @IsNotEmpty()
    lastName: string;
  
    @IsString()
    //@MinLength(2, { message: "Middlename must have atleast 2 characters." })
    @IsOptional()
    otherName?: string;
    @IsString()
    @IsEmail(undefined, { message: "Invalid email address provided" })
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsStrongPassword()
    @Matches(passwordRegEx, {
      message: `Password must contain Minimum 8 and maximum 20 characters, 
      at least one uppercase letter, 
      one lowercase letter, 
      one number and 
      one special character`,
    })
    @MinLength(8, { message: "Password must have atleast 8 characters." })
    @IsNotEmpty()
    password: string;
  }
  