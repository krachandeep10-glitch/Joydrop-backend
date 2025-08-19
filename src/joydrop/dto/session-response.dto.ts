import { ApiProperty } from "@nestjs/swagger";

export class JoydropSessionResponseDto {
  @ApiProperty({
    description: "Unique session ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  sessionId: string;

  @ApiProperty({
    description: "ID of the user who initiated the session",
    example: "user123456789",
  })
  senderId: string;

  @ApiProperty({
    description: "Current status of the session",
    example: "in-progress",
    enum: ["in-progress", "completed", "cancelled"],
  })
  status: "in-progress" | "completed" | "cancelled";

  @ApiProperty({
    description: "When the session was created",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt: string;

  @ApiProperty({
    description: "When the session was last updated",
    example: "2024-01-15T10:35:00.000Z",
  })
  updatedAt: string;

  @ApiProperty({
    description: "Associated post ID if session is completed",
    example: "post123456789",
    required: false,
  })
  postId?: string;
} 