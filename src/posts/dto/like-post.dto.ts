import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LikePostDto {
  @ApiProperty({
    description: "ID of the user liking the post",
    example: "user123456789",
  })
  @IsString()
  @IsNotEmpty()
  userID: string;
}
