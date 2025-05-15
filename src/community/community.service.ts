import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Community, CommunityDocument } from './community.schema';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
  ) {}

  async createCommunity(createCommunityDto: CreateCommunityDto, image?: Express.Multer.File): Promise<Community> {
    const existing = await this.communityModel.findOne({ name: createCommunityDto.name });
    if (existing) {
      throw new ConflictException('Community with this name already exists');
    }
    const createdCommunity = new this.communityModel({
      name: createCommunityDto.name,
      description: createCommunityDto.description,
      members: [],
      membersCount: 0,
    });
    return createdCommunity.save();
  }

  async getCommunities(): Promise<Community[]> {
    return this.communityModel.find().exec();
  }

  async joinCommunity(communityId: string, userId: string): Promise<Community> {
    const community = await this.communityModel.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    const userObjectId = new Types.ObjectId(userId);
    if (community.members.some(member => member.equals(userObjectId))) {
      throw new ConflictException('User is already a member of the community');
    }
    community.members.push(userObjectId);
    community.membersCount += 1;
    await community.save();
    return community;
  }

  async getCommunityById(communityId: string): Promise<Community> {
    const community = await this.communityModel.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }
}
