import { connect } from 'mongoose';
import { PostSchema, Post } from '../post/post.schema';

async function migrateReplies() {
  await connect('mongodb://localhost:27017/your_database_name'); // Replace with your MongoDB connection string

  const PostModel = await import('mongoose').then(mongoose => mongoose.model('Post', PostSchema));

  const posts = await PostModel.find({}).exec();

  for (const post of posts) {
    let modified = false;

    for (const comment of post.comments) {
      if (comment.replies && comment.replies.length > 0) {
        // Check if replies are ObjectId references (only _id present)
        const areRepliesRefs = comment.replies.every(
          (reply: any) => typeof reply === 'object' && Object.keys(reply).length === 1 && (reply as any)._id
        );

        if (areRepliesRefs) {
          // Fetch full reply documents by _id
          const fullReplies = [];

          for (const replyRef of comment.replies) {
            // Assuming replies are stored as separate documents in the same Post collection's comments array
            const postWithReply = await PostModel.findOne(
              { 'comments._id': (replyRef as any)._id },
              { 'comments.$': 1 }
            ).exec();

          if (postWithReply && postWithReply.comments && postWithReply.comments.length > 0) {
            fullReplies.push(postWithReply.comments[0] as unknown as never);
          }
          }

          if (fullReplies.length > 0) {
            comment.replies = fullReplies;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      await post.save();
      console.log(`Updated post ${post._id} with embedded replies.`);
    }
  }

  console.log('Migration completed.');
  process.exit(0);
}

migrateReplies().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
