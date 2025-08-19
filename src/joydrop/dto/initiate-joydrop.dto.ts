import { ApiProperty } from "@nestjs/swagger";

export class InitiateJoydropResponseDto {
  @ApiProperty({
    description: "Unique session ID for the joydrop session",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  sessionId: string;
}
