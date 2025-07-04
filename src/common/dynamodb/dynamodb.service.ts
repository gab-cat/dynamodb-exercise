import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Table } from 'dynamodb-onetable';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class DynamoDBService implements OnModuleInit, OnModuleDestroy {
  private client: DynamoDBClient;
  private table: Table;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.info('Initializing DynamoDB connection');

    this.client = new DynamoDBClient({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.config.get<string>('DYNAMODB_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', 'local'),
        secretAccessKey: this.config.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'local',
        ),
      },
    });

    // Initialize table without schema first
    this.table = new Table({
      name: this.config.get('DYNAMODB_TABLE_NAME', 'inventory-table'),
      client: this.client,
      partial: true,
      logger: (level, message, data) => {
        switch (level) {
          case 'info':
            this.logger.info(message, data);
            break;
          case 'warn':
            this.logger.warn(message, data);
            break;
          case 'error':
            this.logger.error(message, data);
            break;
          case 'trace':
            this.logger.debug(message, data);
            break;
        }
      },
    });

    this.logger.info('DynamoDB connection initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.info('Closing DynamoDB connection');
    // OneTable doesn't require explicit disconnect
    this.logger.info('DynamoDB connection closed');
  }

  getTable(): Table {
    return this.table;
  }

  getClient(): DynamoDBClient {
    return this.client;
  }

  async initializeWithSchema(schema: any): Promise<void> {
    if (!this.client) {
      throw new Error(
        'DynamoDB client not initialized. Call onModuleInit first.',
      );
    }

    this.table = new Table({
      name: this.config.get('DYNAMODB_TABLE_NAME', 'inventory-table'),
      client: this.client,
      schema,
      logger: (level, message, data) => {
        switch (level) {
          case 'info':
            this.logger.info(message, data);
            break;
          case 'warn':
            this.logger.warn(message, data);
            break;
          case 'error':
            this.logger.error(message, data);
            break;
          case 'trace':
            this.logger.debug(message, data);
            break;
        }
      },
    });

    await this.createTableIfNotExists();
  }

  setSchema(schema: any): void {
    if (!this.client) {
      throw new Error(
        'DynamoDB client not initialized. Call onModuleInit first.',
      );
    }

    this.table = new Table({
      name: this.config.get('DYNAMODB_TABLE_NAME', 'inventory-table'),
      client: this.client,
      schema,
      logger: (level, message, data) => {
        switch (level) {
          case 'info':
            this.logger.info(message, data);
            break;
          case 'warn':
            this.logger.warn(message, data);
            break;
          case 'error':
            this.logger.error(message, data);
            break;
          case 'trace':
            this.logger.debug(message, data);
            break;
        }
      },
    });
  }

  private async createTableIfNotExists(): Promise<void> {
    try {
      this.logger.info('Checking if DynamoDB table exists...');

      const tableExists = await this.table.exists();

      if (!tableExists) {
        this.logger.info('Table does not exist. Creating table...');
        await this.table.createTable();
        this.logger.info('DynamoDB table created successfully');
      } else {
        this.logger.info('DynamoDB table already exists');
      }
    } catch (error) {
      this.logger.error('Error checking/creating DynamoDB table:', error);
      throw error;
    }
  }
}
