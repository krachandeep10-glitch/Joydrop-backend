import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsAlphanumeric,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Date of Birth',
    example: '1990-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  dob?: string;

  @ApiProperty({
    description: 'User bio/details shared by user',
    example: 'I love coding and building amazing apps!',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Reason to join Joydrop',
    example: 'I want to connect with like-minded developers',
    required: false,
  })
  @IsString()
  @IsOptional()
  joydropReason?: string;

  @ApiProperty({
    description: 'Referral code used by this user',
    example: 'REF123',
    required: false,
  })
  @IsString()
  @IsOptional()
  referredBy?: string;
} 