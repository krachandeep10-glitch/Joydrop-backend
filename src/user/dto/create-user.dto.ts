import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsAlphanumeric,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "User UID (optional, will be generated if not provided)",
    example: "user123456789",
    required: false,
  })
  @IsString()
  @IsOptional()
  uid?: string;

  @ApiProperty({
    description: "User display name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: "User email address",
    example: "john@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Username",
    example: "john_doe",
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "Date of Birth",
    example: "1990-01-01",
    required: false,
  })
  @IsString()
  @IsOptional()
  dob?: string;

  @ApiProperty({
    description: "User bio/details shared by user",
    example: "I love coding and building amazing apps!",
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: "Reason to join Joydrop",
    example: "I want to connect with like-minded developers",
    required: false,
  })
  @IsString()
  @IsOptional()
  joydropReason?: string;

  @ApiProperty({
    description: "Referral code used by this user",
    example: "REF123",
    required: false,
  })
  @IsString()
  @IsOptional()
  referredBy?: string;
}
