"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({
  text, author, communityId, path
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
};

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Thread.find({
    parentId: { $in: [null, undefined] }
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id name parentId image"
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] }
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: "_id id name image"
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: "_id id name image"
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: "_id id name image"
            }
          }
        ]
      }).exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  connectToDB();

  try {
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error('Thread not found');
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const saveCommentThread = await commentThread.save();

    originalThread.children.push(saveCommentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
}

// Add the like functionality here
interface LikeParams {
  threadId: string;
  userId: string;
  path: string;
}

// Toggle like function
export async function toggleLike({ threadId, userId, path }: LikeParams) {
    try {
      await connectToDB();
  
      // First check if the user has liked the thread
      const thread = await Thread.findById(threadId);
      if (!thread) throw new Error("Thread not found");
  
      const hasLiked = thread.likes && thread.likes.includes(userId);
      
      // Use MongoDB operations directly
      if (hasLiked) {
        await Thread.findByIdAndUpdate(threadId, { $pull: { likes: userId } });
      } else {
        await Thread.findByIdAndUpdate(threadId, { $addToSet: { likes: userId } });
      }
      
      // Get updated thread
      const updatedThread = await Thread.findById(threadId);
      const likes = updatedThread?.likes || [];
      
      revalidatePath(path);
      
      return {
        isLiked: !hasLiked,
        likesCount: likes.length
      };
    } catch (error: any) {
      console.error("Like toggle error:", error);
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }

// Get like status
export async function getLikeStatus({ threadId, userId }: { threadId: string; userId: string }) {
  try {
    await connectToDB();

    const thread = await Thread.findById(threadId);

    if (!thread) {
      return {
        isLiked: false,
        likesCount: 0
      };
    }

    // Initialize likes array if it doesn't exist
    if (!thread.likes) {
      thread.likes = [];
      await thread.save();
    }

    const isLiked = thread.likes.includes(userId);
    
    return {
      isLiked,
      likesCount: thread.likes.length
    };
  } catch (error: any) {
    console.error("Get like status error:", error);
    return {
      isLiked: false,
      likesCount: 0
    };
  }
}