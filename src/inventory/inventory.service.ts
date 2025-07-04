import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Model } from 'dynamodb-onetable';
import { DynamoDBService } from '../common/dynamodb/dynamodb.service';
import { LoggerService } from '../common/logger/logger.service';
import {
  Product,
  Category,
  Supplier,
  Warehouse,
  InventoryLevel,
  StockMovement,
  MovementType,
} from './models/inventory.types';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateStockDto, AdjustInventoryDto } from './dto/update-stock.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class InventoryService implements OnModuleInit {
  private productModel: Model<Product>;
  private categoryModel: Model<Category>;
  private supplierModel: Model<Supplier>;
  private warehouseModel: Model<Warehouse>;
  private inventoryLevelModel: Model<InventoryLevel>;
  private stockMovementModel: Model<StockMovement>;

  constructor(
    private readonly dynamoService: DynamoDBService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Import schema here to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { InventorySchema } = require('./models/inventory.schema');

    // Initialize schema and create table if it doesn't exist
    await this.dynamoService.initializeWithSchema(InventorySchema);

    const table = this.dynamoService.getTable();
    this.productModel = table.getModel('Product');
    this.categoryModel = table.getModel('Category');
    this.supplierModel = table.getModel('Supplier');
    this.warehouseModel = table.getModel('Warehouse');
    this.inventoryLevelModel = table.getModel('InventoryLevel');
    this.stockMovementModel = table.getModel('StockMovement');

    this.logger.info(
      'Inventory service models initialized with table creation',
      {},
      'InventoryService',
    );
  }

  // Product Management
  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      // Check if SKU already exists
      const existingProduct = await this.findProductBySku(data.sku);
      if (existingProduct) {
        throw new ConflictException(
          `Product with SKU '${data.sku}' already exists`,
        );
      }

      const product = await this.productModel.create(data);

      this.logger.info(
        'Product created successfully',
        { productId: product.id },
        'InventoryService',
      );
      return product;
    } catch (error) {
      this.logger.error(
        'Failed to create product',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const product = await this.productModel.get({ id });
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(
        'Failed to get product',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async findProductBySku(sku: string): Promise<Product | null> {
    try {
      const products = await this.productModel.find({ sku }, { index: 'gsi3' });
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      this.logger.error(
        'Failed to find product by SKU',
        { error: error.message, sku },
        'InventoryService',
      );
      throw error;
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      return await this.productModel.find({ categoryId }, { index: 'gsi1' });
    } catch (error) {
      this.logger.error(
        'Failed to get products by category',
        { error: error.message, categoryId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    try {
      return await this.productModel.find({ supplierId }, { index: 'gsi2' });
    } catch (error) {
      this.logger.error(
        'Failed to get products by supplier',
        { error: error.message, supplierId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productModel.scan({});
    } catch (error) {
      this.logger.error(
        'Failed to get all products',
        { error: error.message },
        'InventoryService',
      );
      throw error;
    }
  }

  // Category Management
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryModel.create(data);

      this.logger.info(
        'Category created successfully',
        { categoryId: category.id },
        'InventoryService',
      );
      return category;
    } catch (error) {
      this.logger.error(
        'Failed to create category',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const category = await this.categoryModel.get({ id });
      if (!category) {
        throw new NotFoundException(`Category with ID '${id}' not found`);
      }
      return category;
    } catch (error) {
      this.logger.error(
        'Failed to get category',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      return await this.categoryModel.find({}, { index: 'gsi1' });
    } catch (error) {
      this.logger.error(
        'Failed to get all categories',
        { error: error.message },
        'InventoryService',
      );
      throw error;
    }
  }

  // Supplier Management
  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    try {
      const supplier = await this.supplierModel.create(data);

      this.logger.info(
        'Supplier created successfully',
        { supplierId: supplier.id },
        'InventoryService',
      );
      return supplier;
    } catch (error) {
      this.logger.error(
        'Failed to create supplier',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async getSupplier(id: string): Promise<Supplier> {
    try {
      const supplier = await this.supplierModel.get({ id });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID '${id}' not found`);
      }
      return supplier;
    } catch (error) {
      this.logger.error(
        'Failed to get supplier',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      return await this.supplierModel.find({}, { index: 'gsi1' });
    } catch (error) {
      this.logger.error(
        'Failed to get all suppliers',
        { error: error.message },
        'InventoryService',
      );
      throw error;
    }
  }

  // Warehouse Management
  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse> {
    try {
      const warehouse = await this.warehouseModel.create(data);

      this.logger.info(
        'Warehouse created successfully',
        { warehouseId: warehouse.id },
        'InventoryService',
      );
      return warehouse;
    } catch (error) {
      this.logger.error(
        'Failed to create warehouse',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    try {
      const warehouse = await this.warehouseModel.get({ id });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID '${id}' not found`);
      }
      return warehouse;
    } catch (error) {
      this.logger.error(
        'Failed to get warehouse',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    try {
      return await this.warehouseModel.find({}, { index: 'gsi1' });
    } catch (error) {
      this.logger.error(
        'Failed to get all warehouses',
        { error: error.message },
        'InventoryService',
      );
      throw error;
    }
  }

  // Inventory Level Management
  async getInventoryLevel(
    productId: string,
    warehouseId: string,
  ): Promise<InventoryLevel | null> {
    try {
      const inventoryLevel = await this.inventoryLevelModel.get({
        productId,
        warehouseId,
      });
      return inventoryLevel || null;
    } catch (error) {
      this.logger.error(
        'Failed to get inventory level',
        { error: error.message, productId, warehouseId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getInventoryByProduct(productId: string): Promise<InventoryLevel[]> {
    try {
      return await this.inventoryLevelModel.find(
        { productId },
        { index: 'gsi1' },
      );
    } catch (error) {
      this.logger.error(
        'Failed to get inventory by product',
        { error: error.message, productId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getInventoryByWarehouse(
    warehouseId: string,
  ): Promise<InventoryLevel[]> {
    try {
      return await this.inventoryLevelModel.find({ warehouseId });
    } catch (error) {
      this.logger.error(
        'Failed to get inventory by warehouse',
        { error: error.message, warehouseId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getLowStockItems(): Promise<InventoryLevel[]> {
    try {
      return await this.inventoryLevelModel.find({}, { index: 'gsi2' });
    } catch (error) {
      this.logger.error(
        'Failed to get low stock items',
        { error: error.message },
        'InventoryService',
      );
      throw error;
    }
  }

  // Stock Movement Operations
  async updateStock(data: UpdateStockDto): Promise<void> {
    try {
      const {
        productId,
        warehouseId,
        quantity,
        movementType,
        unitCost,
        referenceType,
        referenceId,
        notes,
        performedBy,
      } = data;

      // Get current inventory level
      let inventoryLevel = await this.getInventoryLevel(productId, warehouseId);
      const previousQuantity = inventoryLevel?.quantityOnHand || 0;
      const newQuantity = previousQuantity + quantity;

      if (newQuantity < 0) {
        throw new ConflictException('Insufficient stock for this operation');
      }

      // Create or update inventory level
      if (inventoryLevel) {
        await this.inventoryLevelModel.update(
          { productId, warehouseId },
          {
            set: {
              quantityOnHand: newQuantity,
              lastUpdated: new Date(),
            },
          },
        );
      } else {
        inventoryLevel = await this.inventoryLevelModel.create({
          productId,
          warehouseId,
          quantityOnHand: newQuantity,
          quantityReserved: 0,
          reorderPoint: 10,
          reorderQuantity: 50,
          lastUpdated: new Date(),
        });
      }

      // Record stock movement
      await this.stockMovementModel.create({
        productId,
        warehouseId,
        movementType,
        quantity,
        previousQuantity,
        newQuantity,
        unitCost,
        referenceType,
        referenceId,
        notes,
        performedBy,
        timestamp: new Date(),
      });

      this.logger.info(
        'Stock updated successfully',
        {
          productId,
          warehouseId,
          movementType,
          quantity,
          newQuantity,
        },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to update stock',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async adjustInventory(data: AdjustInventoryDto): Promise<void> {
    try {
      const { productId, warehouseId, newQuantity, notes, performedBy } = data;

      // Get current inventory level
      const inventoryLevel = await this.getInventoryLevel(
        productId,
        warehouseId,
      );
      const previousQuantity = inventoryLevel?.quantityOnHand || 0;
      const adjustmentQuantity = newQuantity - previousQuantity;

      // Update inventory level
      if (inventoryLevel) {
        await this.inventoryLevelModel.update(
          { productId, warehouseId },
          {
            set: {
              quantityOnHand: newQuantity,
              lastUpdated: new Date(),
            },
          },
        );
      } else {
        await this.inventoryLevelModel.create({
          productId,
          warehouseId,
          quantityOnHand: newQuantity,
          quantityReserved: 0,
          reorderPoint: 10,
          reorderQuantity: 50,
          lastUpdated: new Date(),
        });
      }

      // Record adjustment as stock movement
      await this.stockMovementModel.create({
        productId,
        warehouseId,
        movementType: MovementType.ADJUSTMENT,
        quantity: adjustmentQuantity,
        previousQuantity,
        newQuantity,
        referenceType: 'MANUAL',
        notes,
        performedBy,
        timestamp: new Date(),
      });

      this.logger.info(
        'Inventory adjusted successfully',
        {
          productId,
          warehouseId,
          previousQuantity,
          newQuantity,
          adjustmentQuantity,
        },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to adjust inventory',
        { error: error.message, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async getStockMovements(
    productId: string,
    limit = 50,
  ): Promise<StockMovement[]> {
    try {
      return await this.stockMovementModel.find(
        { productId },
        { limit, reverse: true },
      );
    } catch (error) {
      this.logger.error(
        'Failed to get stock movements',
        { error: error.message, productId },
        'InventoryService',
      );
      throw error;
    }
  }

  async getWarehouseMovements(
    warehouseId: string,
    limit = 50,
  ): Promise<StockMovement[]> {
    try {
      return await this.stockMovementModel.find(
        { warehouseId },
        { index: 'gsi1', limit, reverse: true },
      );
    } catch (error) {
      this.logger.error(
        'Failed to get warehouse movements',
        { error: error.message, warehouseId },
        'InventoryService',
      );
      throw error;
    }
  }

  // Update Operations
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    try {
      // Check if product exists
      const existingProduct = await this.getProduct(id);

      // If SKU is being updated, check for conflicts
      if (data.sku && data.sku !== existingProduct.sku) {
        const existingBySku = await this.findProductBySku(data.sku);
        if (existingBySku && existingBySku.id !== id) {
          throw new ConflictException(
            `Product with SKU '${data.sku}' already exists`,
          );
        }
      }

      const updatedProduct = await this.productModel.update(
        { id },
        { set: { ...data, updatedAt: new Date().toISOString() } },
      );

      this.logger.info(
        'Product updated successfully',
        { productId: id },
        'InventoryService',
      );
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        'Failed to update product',
        { error: error.message, id, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      // Check if category exists
      await this.getCategory(id);

      const updatedCategory = await this.categoryModel.update(
        { id },
        { set: { ...data, updatedAt: new Date().toISOString() } },
      );

      this.logger.info(
        'Category updated successfully',
        { categoryId: id },
        'InventoryService',
      );
      return updatedCategory;
    } catch (error) {
      this.logger.error(
        'Failed to update category',
        { error: error.message, id, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async updateSupplier(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    try {
      // Check if supplier exists
      await this.getSupplier(id);

      const updatedSupplier = await this.supplierModel.update(
        { id },
        { set: { ...data, updatedAt: new Date().toISOString() } },
      );

      this.logger.info(
        'Supplier updated successfully',
        { supplierId: id },
        'InventoryService',
      );
      return updatedSupplier;
    } catch (error) {
      this.logger.error(
        'Failed to update supplier',
        { error: error.message, id, data },
        'InventoryService',
      );
      throw error;
    }
  }

  async updateWarehouse(
    id: string,
    data: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    try {
      // Check if warehouse exists
      await this.getWarehouse(id);

      const updatedWarehouse = await this.warehouseModel.update(
        { id },
        { set: { ...data, updatedAt: new Date().toISOString() } },
      );

      this.logger.info(
        'Warehouse updated successfully',
        { warehouseId: id },
        'InventoryService',
      );
      return updatedWarehouse;
    } catch (error) {
      this.logger.error(
        'Failed to update warehouse',
        { error: error.message, id, data },
        'InventoryService',
      );
      throw error;
    }
  }

  // Delete Operations
  async deleteProduct(id: string): Promise<void> {
    try {
      // Check if product exists
      await this.getProduct(id);

      // Check if product has inventory levels
      const inventoryLevels = await this.getInventoryByProduct(id);
      if (inventoryLevels.length > 0) {
        // Soft delete by marking as inactive
        await this.productModel.update(
          { id },
          { set: { isActive: false, updatedAt: new Date().toISOString() } },
        );

        this.logger.info(
          'Product soft-deleted (marked as inactive) due to existing inventory',
          { productId: id },
          'InventoryService',
        );
        return;
      }

      // Hard delete if no inventory exists
      await this.productModel.remove({ id });

      this.logger.info(
        'Product deleted successfully',
        { productId: id },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete product',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category exists
      await this.getCategory(id);

      // Check if category has products
      const products = await this.getProductsByCategory(id);
      if (products.length > 0) {
        throw new ConflictException(
          'Cannot delete category that has associated products',
        );
      }

      await this.categoryModel.remove({ id });

      this.logger.info(
        'Category deleted successfully',
        { categoryId: id },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete category',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      // Check if supplier exists
      await this.getSupplier(id);

      // Check if supplier has products
      const products = await this.getProductsBySupplier(id);
      if (products.length > 0) {
        // Soft delete by marking as inactive
        await this.supplierModel.update(
          { id },
          { set: { isActive: false, updatedAt: new Date().toISOString() } },
        );

        this.logger.info(
          'Supplier soft-deleted (marked as inactive) due to associated products',
          { supplierId: id },
          'InventoryService',
        );
        return;
      }

      // Hard delete if no products associated
      await this.supplierModel.remove({ id });

      this.logger.info(
        'Supplier deleted successfully',
        { supplierId: id },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete supplier',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }

  async deleteWarehouse(id: string): Promise<void> {
    try {
      // Check if warehouse exists
      await this.getWarehouse(id);

      // Check if warehouse has inventory
      const inventoryLevels = await this.getInventoryByWarehouse(id);
      if (inventoryLevels.length > 0) {
        throw new ConflictException(
          'Cannot delete warehouse that has inventory levels',
        );
      }

      await this.warehouseModel.remove({ id });

      this.logger.info(
        'Warehouse deleted successfully',
        { warehouseId: id },
        'InventoryService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete warehouse',
        { error: error.message, id },
        'InventoryService',
      );
      throw error;
    }
  }
}
