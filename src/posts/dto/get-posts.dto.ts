import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetPostsDto {
  @ApiProperty({
    description: "User ID to filter posts (optional)",
    example: "user123456789",
    required: false,
  })
  @IsOptional()
  @IsString()
  userID?: string;

  @ApiProperty({
    description: "Number of posts to retrieve",
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    description: "Offset for pagination",
    example: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}