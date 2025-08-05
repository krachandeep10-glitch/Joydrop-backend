import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsArray,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({
    description: "ID of the user sending the joydrop",
    example: "user123456789",
  })
  @IsString()
  @IsNotEmpty()
  senderID: string;

  @ApiProperty({
    description:
      "ID of the user receiving the joydrop (optional for public posts)",
    example: "user987654321",
    required: false,
  })
  @IsString()
  @IsOptional()
  receiverID?: string;

  @ApiProperty({
    description: "Compliment message content",
    example: "You're doing amazing work! Keep it up! 🌟",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @ApiProperty({
    description: "Media URLs (images, videos) attached to the joydrop",
    example: [
      "https://example.com/image1.jpg",
      "https://example.com/video1.mp4",
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({
    description: "Tags associated with the post",
    example: ["motivation", "teamwork", "achievement"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
}
