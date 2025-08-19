import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { FirestoreService } from "../firebase/firestore.service";
import { SubmitJoydropDto } from "./dto/submit-joydrop.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { CreatePostDto } from "../posts/dto/create-post.dto";

export interface JoydropSession {
  sessionId: string;
  senderId: string;
  status: "in-progress" | "completed" | "cancelled";
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  postId?: string;
}

@Injectable()
export class JoydropService {
  constructor(private readonly firestoreService: FirestoreService) {}

  async initiateJoydrop(senderId: string): Promise<{ sessionId: string }> {
    const sessionId = uuidv4();
    
    const sessionData: Omit<JoydropSession, "sessionId"> = {
      senderId,
      status: "in-progress",
      createdAt: undefined, // Will be set by FirestoreService
      updatedAt: undefined, // Will be set by FirestoreService
    };

    await this.firestoreService.create("joydropSessions", sessionData, sessionId);

    return { sessionId };
  }

  async getSession(sessionId: string): Promise<JoydropSession | null> {
    return this.firestoreService.findById<JoydropSession>("joydropSessions", sessionId);
  }

  async updateSessionStatus(
    sessionId: string,
    status: "in-progress" | "completed" | "cancelled",
    postId?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: undefined, // Will be set by FirestoreService
    };

    if (postId) {
      updateData.postId = postId;
    }

    await this.firestoreService.update("joydropSessions", sessionId, updateData);
  }

  async submitJoydrop(
    senderId: string,
    submitDto: SubmitJoydropDto
  ): Promise<{ sessionId: string; postId: string; status: string }> {
    // Get the session
    const session = await this.getSession(submitDto.sessionId);
    if (!session) {
      throw new NotFoundException("Joydrop session not found");
    }

    // Verify the session belongs to the sender
    if (session.senderId !== senderId) {
      throw new BadRequestException("You can only submit your own joydrop sessions");
    }

    // Check if session is already completed or cancelled
    if (session.status !== "in-progress") {
      throw new BadRequestException(`Cannot submit session with status: ${session.status}`);
    }

    // Create the post data
    const createPostDto: CreatePostDto = {
      senderID: senderId,
      receiverID: submitDto.receiverID,
      content: submitDto.content,
      mediaUrls: submitDto.mediaUrls,
      tags: submitDto.tags,
    };

    // Create the post
    const postResult = await this.firestoreService.create("posts", {
      senderID: createPostDto.senderID,
      receiverID: createPostDto.receiverID || null,
      content: createPostDto.content,
      mediaUrls: createPostDto.mediaUrls || [],
      tags: createPostDto.tags || [],
      commentsCount: 0,
      likesCount: 0,
      isPublic: !createPostDto.receiverID, // Public if no specific receiver
    });

    // Update session status to completed and link to post
    await this.updateSessionStatus(submitDto.sessionId, "completed", postResult.id);

    return {
      sessionId: submitDto.sessionId,
      postId: postResult.id,
      status: "completed",
    };
  }

  async getUserSessions(userId: string): Promise<JoydropSession[]> {
    return this.firestoreService.findMany<JoydropSession>(
      "joydropSessions",
      [
        {
          field: "senderId",
          operator: "==",
          value: userId,
        },
      ],
      50, // Limit to 50 sessions
      { field: "createdAt", direction: "desc" }
    );
  }

  async cancelSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new NotFoundException("Joydrop session not found");
    }

    if (session.senderId !== userId) {
      throw new BadRequestException("You can only cancel your own joydrop sessions");
    }

    if (session.status !== "in-progress") {
      throw new BadRequestException(`Cannot cancel session with status: ${session.status}`);
    }

    await this.updateSessionStatus(sessionId, "cancelled");
  }
} 