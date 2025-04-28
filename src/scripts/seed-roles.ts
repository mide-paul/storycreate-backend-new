import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleSeeder {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async seed() {
    const roles = [
      {
        name: 'creator',
        description: 'Content creator role',
      },
      {
        name: 'admin',
        description: 'Administrator role',
      },
      {
        name: 'user',
        description: 'Regular user role',
      },
    ];

    for (const role of roles) {
      const existingRole = await this.roleModel.findOne({ name: role.name }).exec();
      if (!existingRole) {
        await this.roleModel.create(role);
        console.log(`Created role: ${role.name}`);
      }
    }
  }
} 