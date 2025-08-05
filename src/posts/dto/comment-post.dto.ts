import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CommentPostDto {
  @ApiProperty({
    description: "ID of the user commenting on the post",
    example: "user123456789",
  })
  @IsString()
  @IsNotEmpty()
  userID: string;

  @ApiProperty({
    description: "Comment content",
    example: "This is so inspiring! Thanks for sharing!",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  comment: string;
}
