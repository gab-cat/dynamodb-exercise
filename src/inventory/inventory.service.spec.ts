import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { DynamoDBService } from '../common/dynamodb/dynamodb.service';
import { LoggerService } from '../common/logger/logger.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockDynamoService: jest.Mocked<DynamoDBService>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const mockTable = {
      getModel: jest.fn().mockReturnValue({
        create: jest.fn(),
        get: jest.fn(),
        find: jest.fn(),
        scan: jest.fn(),
        update: jest.fn(),
      }),
    };

    mockDynamoService = {
      getTable: jest.fn().mockReturnValue(mockTable),
      setSchema: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: DynamoDBService,
          useValue: mockDynamoService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with DynamoDB models', () => {
    expect(mockDynamoService.setSchema).toHaveBeenCalled();
    expect(mockDynamoService.getTable).toHaveBeenCalled();
  });
});
