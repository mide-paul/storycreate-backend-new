import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { CommentPostDto } from './dto/comment-post.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly mediaService: MediaService,
  ) {}

  async createPost(createPostDto: CreatePostDto, file?: Express.Multer.File, communityId?: string): Promise<Post> {
    try {
      let imageUrl: string | undefined = undefined;

      if (file) {
        const uploadResult = await this.mediaService.addMedia(file);
        if (!uploadResult || !uploadResult.url) {
          throw new InternalServerErrorException('Failed to upload image');
        }
        imageUrl = uploadResult.url;
      }

      const postData: any = {
        author: createPostDto.author,
        text: createPostDto.text,
        imageUrl,
        likes: 0,
        comments: [],
      };

      if (communityId) {
        postData.communityId = new Types.ObjectId(communityId);
      }

      const createdPost = new this.postModel(postData);

      return await createdPost.save();
    } catch (error) {
      console.error('Error creating post:', error);
      throw new InternalServerErrorException(error.message || 'Error creating post');
    }
  }

  async getPosts(): Promise<Post[]> {
    return this.postModel.find({ communityId: { $exists: false } }).sort({ createdAt: -1 }).exec();
  }

  async getPostsByCommunity(communityId: string): Promise<Post[]> {
    return this.postModel.find({ communityId: new Types.ObjectId(communityId) }).sort({ createdAt: -1 }).exec();
  }

  async likePost(postId: string, likePostDto: LikePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.likes += 1;
    return post.save();
  }

  async commentPost(postId: string, commentPostDto: CommentPostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.comments.push({
      userId: new Types.ObjectId(commentPostDto.userId),
      text: commentPostDto.text,
      createdAt: new Date(),
    });
    return post.save();
  }
}
