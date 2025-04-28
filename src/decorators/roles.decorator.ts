// import { SetMetadata } from '@nestjs/common';
// import { Reflector } from "@nestjs/core";

// export const Roles = Reflector.createDecorator<string[]>();



// export const ROLES_KEY = 'roles';
// export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
import { SetMetadata } from '@nestjs/common';
import { AccessLevel } from 'src/core/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AccessLevel[]) => SetMetadata(ROLES_KEY, roles);