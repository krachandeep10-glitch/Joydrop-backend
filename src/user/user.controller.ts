import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(":uid")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get user by UID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserByUid(@Param("uid") uid: string) {
    return this.userService.getUserByUid(uid);
  }

  @Get("email/:email")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Find user by email" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findUserByEmail(@Param("email") email: string) {
    return this.userService.findUserByEmail(email);
  }

  @Get("id/:userId")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Find user by ID" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findUserById(@Param("userId") userId: string) {
    return this.userService.findUserById(userId);
  }

  @Get("username/:username")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Find user by username" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findUserByUsername(@Param("username") username: string) {
    return this.userService.findUserByUsername(username);
  }

  @Put(":uid")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUser(
    @Param("uid") uid: string,
    @Body() updateData: Partial<UpdateUserDto>,
  ) {
    return this.userService.updateUser(uid, updateData);
  }

  @Delete(":uid")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async deleteUser(@Param("uid") uid: string) {
    return this.userService.deleteUser(uid);
  }
}
