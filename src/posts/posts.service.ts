import { Injectable } from "@nestjs/common";
import { FirestoreService } from "../firebase/firestore.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { LikePostDto } from "./dto/like-post.dto";
import { CommentPostDto } from "./dto/comment-post.dto";
import { GetPostsDto } from "./dto/get-posts.dto";
import * as admin from "firebase-admin";

interface PostData {
  id: string;
  senderID: string;
  receiverID?: string;
  content: string;
  mediaUrls?: string[];
  tags?: string[];
  commentsCount: number;
  likesCount: number;
  isPublic: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface LikeData {
  userID: string;
  likedAt: admin.firestore.Timestamp;
}

interface CommentData {
  userID: string;
  comment: string;
  commentedAt: admin.firestore.Timestamp;
}

@Injectable()
export class PostsService {
  constructor(private readonly firestoreService: FirestoreService) {}

  async createPost(createPostDto: CreatePostDto) {
    try {
      const postData = {
        senderID: createPostDto.senderID,
        receiverID: createPostDto.receiverID || null,
        content: createPostDto.content,
        mediaUrls: createPostDto.mediaUrls || [],
        tags: createPostDto.tags || [],
        commentsCount: 0,
        likesCount: 0,
        isPublic: !createPostDto.receiverID, // Public if no specific receiver
      };

      const result = await this.firestoreService.create("posts", postData);

      // If it's a private joydrop (has receiverID), also save to user's profile
      if (createPostDto.receiverID) {
        await this.saveToUserProfile(createPostDto.receiverID, result.id);
      }

      return {
        statusCode: 201,
        status: "success",
        message: "Joydrop sent successfully",
        data: {
          postId: result.id,
          ...postData,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to send joydrop",
        data: {},
      };
    }
  }

  async getPosts(getPostsDto: GetPostsDto) {
    try {
      let filters: any[] = [];
      
      // Filter by user if specified
      if (getPostsDto.userID) {
        filters.push({
          field: "senderID",
          operator: "==",
          value: getPostsDto.userID,
        });
      }

      // Get public posts or user-specific posts
      if (!getPostsDto.userID) {
        filters.push({
          field: "isPublic",
          operator: "==",
          value: true,
        });
      }

      const posts = await this.firestoreService.findMany<PostData>(
        "posts",
        filters,
        getPostsDto.limit,
        { field: "createdAt", direction: "desc" }
      );

      // Enrich posts with user data (batch operation for efficiency)
      const enrichedPosts = await this.enrichPostsWithUserData(posts);
  
      return {
        statusCode: 200,
        status: "success",
        message: "Posts retrieved successfully",
        data: {
          posts: enrichedPosts,
          total: enrichedPosts.length,
          hasMore: enrichedPosts.length === getPostsDto.limit,
        },
      };
    } catch (error) {
      console.error("Error getting posts:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to retrieve posts",
        data: { posts: [], total: 0 },
      };
    }
  }

  async getPostById(postId: string) {
    try {
      const post = await this.firestoreService.findById<PostData>("posts", postId);

      if (!post) {
        return {
          statusCode: 404,
          status: "error",
          message: "Post not found",
          data: {},
        };
      }

      // Enrich with user data
      const enrichedPost = await this.enrichPostsWithUserData([post]);

      return {
        statusCode: 200,
        status: "success",
        message: "Post retrieved successfully",
        data: enrichedPost[0],
      };
    } catch (error) {
      console.error("Error getting post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to retrieve post",
        data: {},
      };
    }
  }

  async likePost(postId: string, likePostDto: LikePostDto) {
    try {
      // Check if user already liked the post
      const existingLike = await this.firestoreService.findOne<LikeData>(
        `posts/${postId}/likes`,
        "userID",
        likePostDto.userID
      );

      if (existingLike) {
        return {
          statusCode: 409,
          status: "error",
          message: "Post already liked by this user",
          data: {},
        };
      }

      // Use batch operation for atomic like creation and count increment
      const batch = this.firestoreService.batch();
      const firestore = this.firestoreService.getCollection("posts").firestore;

      // Add like to subcollection
      const likeRef = firestore.collection(`posts/${postId}/likes`).doc();
      batch.set(likeRef, {
        userID: likePostDto.userID,
        likedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Increment likes count in post
      const postRef = firestore.collection("posts").doc(postId);
      batch.update(postRef, {
        likesCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return {
        statusCode: 200,
        status: "success",
        message: "Post liked successfully",
        data: { postId, userID: likePostDto.userID },
      };
    } catch (error) {
      console.error("Error liking post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to like post",
        data: {},
      };
    }
  }

  async unlikePost(postId: string, userID: string) {
    try {
      // Find the like document
      const likesRef = this.firestoreService.getCollection(`posts/${postId}/likes`);
      const likeQuery = await likesRef.where("userID", "==", userID).get();

      if (likeQuery.empty) {
        return {
          statusCode: 404,
          status: "error",
          message: "Like not found",
          data: {},
        };
      }

      // Use batch operation for atomic like deletion and count decrement
      const batch = this.firestoreService.batch();
      const firestore = this.firestoreService.getCollection("posts").firestore;

      // Delete the like
      batch.delete(likeQuery.docs[0].ref);

      // Decrement likes count in post
      const postRef = firestore.collection("posts").doc(postId);
      batch.update(postRef, {
        likesCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return {
        statusCode: 200,
        status: "success",
        message: "Post unliked successfully",
        data: { postId, userID },
      };
    } catch (error) {
      console.error("Error unliking post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to unlike post",
        data: {},
      };
    }
  }

  async commentOnPost(postId: string, commentPostDto: CommentPostDto) {
    try {
      // Use batch operation for atomic comment creation and count increment
      const batch = this.firestoreService.batch();
      const firestore = this.firestoreService.getCollection("posts").firestore;

      // Add comment to subcollection
      const commentRef = firestore.collection(`posts/${postId}/comments`).doc();
      batch.set(commentRef, {
        userID: commentPostDto.userID,
        comment: commentPostDto.comment,
        commentedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Increment comments count in post
      const postRef = firestore.collection("posts").doc(postId);
      batch.update(postRef, {
        commentsCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return {
        statusCode: 201,
        status: "success",
        message: "Comment added successfully",
        data: {
          commentId: commentRef.id,
          postId,
          userID: commentPostDto.userID,
          comment: commentPostDto.comment,
          commentedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error commenting on post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to add comment",
        data: {},
      };
    }
  }

  async getPostComments(postId: string, limit: number = 20) {
    try {
      const comments = await this.firestoreService.findMany<CommentData>(
        `posts/${postId}/comments`,
        [],
        limit,
        { field: "commentedAt", direction: "desc" }
      );

      // Enrich comments with user data (batch operation)
      const enrichedComments = await this.enrichCommentsWithUserData(comments);

      return {
        statusCode: 200,
        status: "success",
        message: "Comments retrieved successfully",
        data: {
          comments: enrichedComments,
          total: enrichedComments.length,
          hasMore: enrichedComments.length === limit,
        },
      };
    } catch (error) {
      console.error("Error getting comments:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to retrieve comments",
        data: { comments: [], total: 0 },
      };
    }
  }

  async getPostLikes(postId: string, limit: number = 20) {
    try {
      const likes = await this.firestoreService.findMany<LikeData>(
        `posts/${postId}/likes`,
        [],
        limit,
        { field: "likedAt", direction: "desc" }
      );

      // Enrich likes with user data (batch operation)
      const enrichedLikes = await this.enrichLikesWithUserData(likes);

      return {
        statusCode: 200,
        status: "success",
        message: "Likes retrieved successfully",
        data: {
          likes: enrichedLikes,
          total: enrichedLikes.length,
          hasMore: enrichedLikes.length === limit,
        },
      };
    } catch (error) {
      console.error("Error getting likes:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to retrieve likes",
        data: { likes: [], total: 0 },
      };
    }
  }

  async deletePost(postId: string, userID: string) {
    try {
      // First verify the user owns the post
      const post = await this.firestoreService.findById<PostData>("posts", postId);
      
      if (!post) {
        return {
          statusCode: 404,
          status: "error",
          message: "Post not found",
          data: {},
        };
      }

      if (post.senderID !== userID) {
        return {
          statusCode: 403,
          status: "error",
          message: "Unauthorized to delete this post",
          data: {},
        };
      }

      // Delete post and all subcollections (likes, comments)
      await this.deletePostWithSubcollections(postId);

      return {
        statusCode: 200,
        status: "success",
        message: "Post deleted successfully",
        data: { postId },
      };
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        statusCode: 500,
        status: "error",
        message: "Failed to delete post",
        data: {},
      };
    }
  }

  // Private helper methods
  private async enrichPostsWithUserData(posts: PostData[]): Promise<any[]> {
    const userIds = new Set<string>();
    posts.forEach(post => {
      userIds.add(post.senderID);
      if (post.receiverID) userIds.add(post.receiverID);
    });

    const userDataMap = await this.getUserDataBatch(Array.from(userIds));

    return posts.map(post => ({
      ...post,
      sender: userDataMap.get(post.senderID) || null,
      receiver: post.receiverID ? userDataMap.get(post.receiverID) || null : null,
    }));
  }

  private async enrichCommentsWithUserData(comments: CommentData[]): Promise<any[]> {
    const userIds = comments.map(comment => comment.userID);
    const userDataMap = await this.getUserDataBatch(userIds);

    return comments.map(comment => ({
      ...comment,
      user: userDataMap.get(comment.userID) || null,
    }));
  }

  private async enrichLikesWithUserData(likes: LikeData[]): Promise<any[]> {
    const userIds = likes.map(like => like.userID);
    const userDataMap = await this.getUserDataBatch(userIds);

    return likes.map(like => ({
      ...like,
      user: userDataMap.get(like.userID) || null,
    }));
  }

  private async getUserDataBatch(userIds: string[]): Promise<Map<string, any>> {
    const userDataMap = new Map();
    
    // Process in batches of 10 (Firestore limit)
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const userDataPromises = batch.map(async (userId) => {
        try {
          const userData = await this.firestoreService.findById("users", userId);
          return { userId, userData };
        } catch (error) {
          console.error(`Error fetching user data for ${userId}:`, error);
          return { userId, userData: null };
        }
      });

      const results = await Promise.allSettled(userDataPromises);
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.userData) {
          userDataMap.set(result.value.userId, result.value.userData);
        }
      });
    }

    return userDataMap;
  }

  private async saveToUserProfile(userId: string, postId: string) {
    try {
      // Add post reference to user's profile (for private joydrops received)
      const userProfileData = {
        postId,
        type: 'received_joydrop',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.firestoreService.create(`users/${userId}/posts`, userProfileData);
    } catch (error) {
      console.error("Error saving to user profile:", error);
      // Don't throw error as this is not critical for post creation
    }
  }

  private async deletePostWithSubcollections(postId: string) {
    const batch = this.firestoreService.batch();
    const firestore = this.firestoreService.getCollection("posts").firestore;

    // Delete main post
    const postRef = firestore.collection("posts").doc(postId);
    batch.delete(postRef);

    // Delete likes subcollection
    const likesSnapshot = await firestore.collection(`posts/${postId}/likes`).get();
    likesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete comments subcollection
    const commentsSnapshot = await firestore.collection(`posts/${postId}/comments`).get();
    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  }
}