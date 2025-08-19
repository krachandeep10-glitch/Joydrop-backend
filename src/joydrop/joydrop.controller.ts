import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";
import { JoydropService } from "./joydrop.service";
import { InitiateJoydropResponseDto } from "./dto/initiate-joydrop.dto";
import { SubmitJoydropDto } from "./dto/submit-joydrop.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { JoydropSessionResponseDto } from "./dto/session-response.dto";

@ApiTags("Joydrop")
@Controller("joydrop")
export class JoydropController {
  constructor(private readonly joydropService: JoydropService) {}

  @Post("initiate")
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Initiate a new joydrop session",
    description: "Creates a new joydrop session for the authenticated user",
  })
  @ApiResponse({
    status: 201,
    description: "Joydrop session initiated successfully",
    type: InitiateJoydropResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async initiateJoydrop(
    @Request() req: any,
  ): Promise<InitiateJoydropResponseDto> {
    const senderId = req.user.uid;
    return this.joydropService.initiateJoydrop(senderId);
  }

  @Post("submit")
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Submit a joydrop session",
    description: "Submits joydrop content and creates a post, completing the session",
  })
  @ApiResponse({
    status: 201,
    description: "Joydrop submitted successfully and post created",
    schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        postId: { type: "string" },
        status: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid session or already completed",
  })
  @ApiResponse({
    status: 404,
    description: "Session not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async submitJoydrop(
    @Request() req: any,
    @Body() submitDto: SubmitJoydropDto,
  ) {
    const senderId = req.user.uid;
    return await this.joydropService.submitJoydrop(senderId, submitDto);
  }

  @Get("sessions/:sessionId")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: "sessionId",
    description: "UUID of the joydrop session",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOperation({
    summary: "Get joydrop session details",
    description: "Retrieves details of a specific joydrop session",
  })
  @ApiResponse({
    status: 200,
    description: "Session details retrieved successfully",
    type: JoydropSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Session not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async getSession(
    @Param("sessionId", ParseUUIDPipe) sessionId: string,
  ): Promise<JoydropSessionResponseDto | null> {
    return await this.joydropService.getSession(sessionId);
  }

  @Get("sessions")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user's joydrop sessions",
    description: "Retrieves all joydrop sessions for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "User sessions retrieved successfully",
    type: [JoydropSessionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async getUserSessions(
    @Request() req: any,
  ): Promise<JoydropSessionResponseDto[]> {
    const userId = req.user.uid;
    return await this.joydropService.getUserSessions(userId);
  }

  @Put("sessions/:sessionId/status")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: "sessionId",
    description: "UUID of the joydrop session",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOperation({
    summary: "Update joydrop session status",
    description: "Updates the status of a joydrop session",
  })
  @ApiResponse({
    status: 200,
    description: "Session status updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid status or session",
  })
  @ApiResponse({
    status: 404,
    description: "Session not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async updateSessionStatus(
    @Request() req: any,
    @Param("sessionId", ParseUUIDPipe) sessionId: string,
    @Body() updateDto: UpdateSessionDto,
  ): Promise<{ message: string }> {
    const userId = req.user.uid;
    await this.joydropService.updateSessionStatus(sessionId, updateDto.status);
    return { message: "Session status updated successfully" };
  }

  @Delete("sessions/:sessionId")
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiParam({
    name: "sessionId",
    description: "UUID of the joydrop session",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOperation({
    summary: "Cancel joydrop session",
    description: "Cancels an in-progress joydrop session",
  })
  @ApiResponse({
    status: 204,
    description: "Session cancelled successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Cannot cancel completed session",
  })
  @ApiResponse({
    status: 404,
    description: "Session not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  async cancelSession(
    @Request() req: any,
    @Param("sessionId", ParseUUIDPipe) sessionId: string,
  ): Promise<void> {
    const userId = req.user.uid;
    await this.joydropService.cancelSession(sessionId, userId);
  }
}
