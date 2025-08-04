import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirestoreSetupService } from './firestore-setup.service';

@ApiTags('Firestore Setup')
@Controller('firestore')
export class FirestoreSetupController {
  constructor(private readonly firestoreSetupService: FirestoreSetupService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize Firestore collections' })
  @ApiResponse({
    status: 201,
    description: 'Collections initialized successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async initializeCollections() {
    return this.firestoreSetupService.initializeCollections();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get Firestore collection statistics' })
  @ApiResponse({
    status: 200,
    description: 'Collection statistics retrieved',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'number' },
        collections: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getCollectionStats() {
    return this.firestoreSetupService.getCollectionStats();
  }


}
