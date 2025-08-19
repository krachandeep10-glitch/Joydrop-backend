import { IsString, IsNotEmpty, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSessionDto {
  @ApiProperty({
    description: "New status for the joydrop session",
    example: "completed",
    enum: ["in-progress", "completed", "cancelled"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["in-progress", "completed", "cancelled"])
  status: "in-progress" | "completed" | "cancelled";
} 