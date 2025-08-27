import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { LikePostDto } from "./dto/like-post.dto";
import { CommentPostDto } from "./dto/comment-post.dto";
import { GetPostsDto } from "./dto/get-posts.dto";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";

@ApiTags("Posts (Joydrops)")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post("create")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Send a Joydrop",
    description:
      "Create a new joydrop post. Can be public or sent to a specific user.",
  })
  @ApiResponse({ status: 201, description: "Joydrop sent successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(createPostDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get posts feed",
    description:
      "Retrieve posts from the feed. Can filter by user or get public posts.",
  })
  @ApiQuery({
    name: "userID",
    required: false,
    description: "Filter posts by specific user",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of posts to retrieve (max 50)",
    example: 10,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Offset for pagination",
    example: 0,
  })
  @ApiResponse({ status: 200, description: "Posts retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPosts(@Query() getPostsDto: GetPostsDto) {
    return this.postsService.getPosts(getPostsDto);
  }

  @Get(":postId")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get post by ID",
    description: "Retrieve a specific post by its ID.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post to retrieve",
    example: "post123456789",
  })
  @ApiResponse({ status: 200, description: "Post retrieved successfully" })
  @ApiResponse({ status: 404, description: "Post not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPostById(@Param("postId") postId: string) {
    return this.postsService.getPostById(postId);
  }

  @Post(":postId/like")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Like a post",
    description: "Add a like to a specific post.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post to like",
    example: "post123456789",
  })
  @ApiResponse({ status: 200, description: "Post liked successfully" })
  @ApiResponse({ status: 409, description: "Post already liked by this user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async likePost(
    @Param("postId") postId: string,
    @Body() likePostDto: LikePostDto,
  ) {
    return this.postsService.likePost(postId, likePostDto);
  }

  @Delete(":postId/like/:userID")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Unlike a post",
    description: "Remove a like from a specific post.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post to unlike",
    example: "post123456789",
  })
  @ApiParam({
    name: "userID",
    description: "ID of the user who liked the post",
    example: "user123456789",
  })
  @ApiResponse({ status: 200, description: "Post unliked successfully" })
  @ApiResponse({ status: 404, description: "Like not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async unlikePost(
    @Param("postId") postId: string,
    @Param("userID") userID: string,
  ) {
    return this.postsService.unlikePost(postId, userID);
  }

  @Post(":postId/comment")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Comment on a post",
    description: "Add a comment to a specific post.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post to comment on",
    example: "post123456789",
  })
  @ApiResponse({ status: 201, description: "Comment added successfully" })
  @ApiResponse({ status: 400, description: "Invalid comment data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async commentOnPost(
    @Param("postId") postId: string,
    @Body() commentPostDto: CommentPostDto,
  ) {
    return this.postsService.commentOnPost(postId, commentPostDto);
  }

  @Get(":postId/comments")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get post comments",
    description: "Retrieve comments for a specific post.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post",
    example: "post123456789",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of comments to retrieve",
    example: 20,
  })
  @ApiResponse({ status: 200, description: "Comments retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPostComments(
    @Param("postId") postId: string,
    @Query("limit") limit?: string,
  ) {
    const commentLimit = limit ? Math.min(parseInt(limit), 100) : 20;
    return this.postsService.getPostComments(postId, commentLimit);
  }

  @Get(":postId/likes")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get post likes",
    description: "Retrieve likes for a specific post.",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post",
    example: "post123456789",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of likes to retrieve",
    example: 20,
  })
  @ApiResponse({ status: 200, description: "Likes retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPostLikes(
    @Param("postId") postId: string,
    @Query("limit") limit?: string,
  ) {
    const likeLimit = limit ? Math.min(parseInt(limit), 100) : 20;
    return this.postsService.getPostLikes(postId, likeLimit);
  }

  @Delete(":postId")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete a post",
    description: "Delete a post (only by the post owner).",
  })
  @ApiParam({
    name: "postId",
    description: "ID of the post to delete",
    example: "post123456789",
  })
  @ApiQuery({
    name: "userID",
    required: true,
    description: "ID of the user requesting deletion",
    example: "user123456789",
  })
  @ApiResponse({ status: 200, description: "Post deleted successfully" })
  @ApiResponse({ status: 403, description: "Unauthorized to delete this post" })
  @ApiResponse({ status: 404, description: "Post not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async deletePost(
    @Param("postId") postId: string,
    @Query("userID") userID: string,
  ) {
    return this.postsService.deletePost(postId, userID);
  }
}
