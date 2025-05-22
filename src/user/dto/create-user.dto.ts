import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
    Matches,
    MinLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from "class-validator";

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

@ValidatorConstraint({ name: "MatchPassword", async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(confirmPassword: any, args: ValidationArguments) {
    const object = args.object as any;
    return confirmPassword === object.password;
  }

  defaultMessage(args: ValidationArguments) {
    return "Confirm password must match password";
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Will be split into firstName and lastName in service

  @IsString()
  @IsEmail(undefined, { message: "Invalid email address provided" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsStrongPassword()
  @Matches(passwordRegEx, {
    message: "Password must contain Minimum 8 and maximum 20 characters, \n\
at least one uppercase letter, \n\
one lowercase letter, \n\
one number and \n\
one special character",
  })
  @MinLength(8, { message: "Password must have at least 8 characters." })
  @IsNotEmpty()
  password: string;

  @IsString()
  @Validate(MatchPassword)
  confirmPassword: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
