import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { LoggerService } from '../common/logger/logger.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let mockInventoryService: jest.Mocked<InventoryService>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    mockInventoryService = {
      createProduct: jest.fn(),
      getAllProducts: jest.fn(),
      getProduct: jest.fn(),
      findProductBySku: jest.fn(),
      createCategory: jest.fn(),
      getAllCategories: jest.fn(),
      createSupplier: jest.fn(),
      createWarehouse: jest.fn(),
      updateStock: jest.fn(),
      adjustInventory: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have admin test endpoint', async () => {
    const result = await controller.adminTest();
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('module', 'inventory');
  });
});
