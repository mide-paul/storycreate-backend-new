import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, Comment, CommentDocument } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { CommentPostDto } from './dto/comment-post.dto';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
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
    const posts = await this.postModel.find({ communityId: { $exists: false } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments.userId',
        select: 'person',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .populate({
        path: 'comments.replies.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .select('author text imageUrl likes comments createdAt updatedAt')
      .exec();

    // Transform comments and replies to include author field
    const transformedPosts = await Promise.all(posts.map(async post => {
      const postObj = post.toObject();
      postObj.comments = await this.transformComments(postObj.comments);
      return postObj;
    }));

    return transformedPosts;
  }

  private async transformComments(comments: any[]): Promise<any[]> {
    return Promise.all(comments.map(async comment => {
      const transformedReplies = comment.replies ? await this.transformComments(comment.replies) : [];
      let commentAuthor: string = '';
      if (comment.userId?.person) {
        commentAuthor = `${comment.userId.person.firstName} ${comment.userId.person.lastName}`;
      } else if (comment.userId) {
        try {
          const user = await this.userService.findOne(comment.userId.toString());
          commentAuthor = user.person ? `${user.person.firstName} ${user.person.lastName}` : '';
        } catch {
          commentAuthor = '';
        }
      }
      return {
        ...comment,
        author: commentAuthor,
        replies: await Promise.all(transformedReplies.map(async reply => {
          let replyAuthor: string | null = null;
          if (reply.userId?.person) {
            replyAuthor = `${reply.userId.person.firstName} ${reply.userId.person.lastName}`;
          } else if (reply.userId) {
            try {
              const user = await this.userService.findOne(reply.userId.toString());
              replyAuthor = user.person ? `${user.person.firstName} ${user.person.lastName}` : null;
            } catch (error) {
              console.error(`Failed to fetch user for reply userId ${reply.userId}:`, error);
              replyAuthor = null;
            }
          }
          return {
            author: replyAuthor,
            text: reply.text || '[No text provided]',
            createdAt: reply.createdAt || new Date(0).toISOString(),
          };
        })),
      };
    }));
  }

  async getPostsByCommunity(communityId: string): Promise<Post[]> {
    const posts = await this.postModel.find({ communityId: new Types.ObjectId(communityId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments.userId',
        select: 'person',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .populate({
        path: 'comments.replies.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .select('author text imageUrl likes comments createdAt updatedAt')
      .exec();

    // Transform comments and replies to include author field
    const transformedPosts = await Promise.all(posts.map(async post => {
      const postObj = post.toObject();
      postObj.comments = await this.transformComments(postObj.comments);
      return postObj;
    }));

    return transformedPosts;
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId)
      .populate({
        path: 'comments.userId',
        select: 'person',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .populate({
        path: 'comments.replies.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      })
      .select('author text imageUrl likes comments createdAt updatedAt');
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const postObj = post.toObject();
    postObj.comments = await this.transformComments(postObj.comments);
    return postObj;
  }

  async likePost(postId: string, likePostDto: LikePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.likes += 1;
    return post.save();
  }

  async unlikePost(postId: string, likePostDto: LikePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.likes = Math.max(0, post.likes - 1);
    return post.save();
  }

  async commentPost(postId: string, commentPostDto: CommentPostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Sanitize replies to ensure it is an array of ObjectIds (empty array here)
    const sanitizedReplies: Types.ObjectId[] = [];

    post.comments.push({
      userId: new Types.ObjectId(commentPostDto.userId),
      text: commentPostDto.text,
      likes: 0,
      replies: sanitizedReplies,
      createdAt: new Date(),
    });
    return post.save();
  }

  async likeComment(postId: string, commentId: string, likePostDto: LikePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Find the comment by id recursively
    const comment = this.findCommentById(post.comments, commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.likes += 1;
    return post.save();
  }

  async unlikeComment(postId: string, commentId: string, likePostDto: LikePostDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Find the comment by id recursively
    const comment = this.findCommentById(post.comments, commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.likes = Math.max(0, comment.likes - 1);
    return post.save();
  }

  async replyToComment(postId: string, commentId: string, commentPostDto: CommentPostDto): Promise<Post> {
    // Create a new Comment document for the reply
    const newReply = new this.commentModel({
      userId: new Types.ObjectId(commentPostDto.userId),
      text: commentPostDto.text,
      likes: 0,
      replies: [],
      createdAt: new Date(),
    });

    await newReply.save();

    // Push the new reply's ObjectId into the replies array of the parent comment
    // Sanitize replies to ensure it is an array of ObjectIds
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comment = this.findCommentById(post.comments, commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!Array.isArray(comment.replies)) {
      comment.replies = [];
    }
    comment.replies.push(newReply._id);
    await post.save();

    const updateResult = await this.postModel.findById(postId)
      .populate({
        path: 'comments.userId',
        select: 'person',
        populate: { path: 'person', select: 'firstName lastName' },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'userId',
          select: 'person',
          populate: { path: 'person', select: 'firstName lastName' },
        },
        select: 'text createdAt likes replies userId',
      });

    if (!updateResult) {
      throw new NotFoundException('Post or comment not found');
    }

    const postObj = updateResult.toObject();
    postObj.comments = await this.transformComments(postObj.comments);
    return postObj;
  }

  private findCommentById(comments: any[], commentId: string): any {
    if (!Array.isArray(comments)) {
      return null;
    }
    for (const comment of comments) {
      if (comment._id.toString() === commentId) {
        return comment;
      }
      const foundInReplies = this.findCommentById(comment.replies, commentId);
      if (foundInReplies) {
        return foundInReplies;
      }
    }
    return null;
  }
}
