import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from 'generated/prisma/client';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateStockDto, AdjustInventoryDto } from './dto/update-stock.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiCookieAuth('Authentication')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly logger: LoggerService,
  ) {}

  // Product endpoints
  @Post('products')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product in the inventory system with all required details.',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.inventoryService.createProduct(createProductDto);
    return product;
  }

  @Get('products')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieves all products in the inventory system.',
  })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getAllProducts() {
    return this.inventoryService.getAllProducts();
  }

  @Get('products/:id')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a specific product by its unique identifier.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Get('products/sku/:sku')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Find product by SKU',
    description: 'Retrieves a product by its Stock Keeping Unit (SKU).',
  })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySku(@Param('sku') sku: string) {
    const product = await this.inventoryService.findProductBySku(sku);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @Get('products/category/:categoryId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieves all products belonging to a specific category.',
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.inventoryService.getProductsByCategory(categoryId);
  }

  @Get('products/supplier/:supplierId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get products by supplier',
    description: 'Retrieves all products from a specific supplier.',
  })
  @ApiParam({ name: 'supplierId', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProductsBySupplier(@Param('supplierId') supplierId: string) {
    return this.inventoryService.getProductsBySupplier(supplierId);
  }

  // Category endpoints
  @Post('categories')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new product category for organizing inventory.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const category =
      await this.inventoryService.createCategory(createCategoryDto);
    this.logger.info(
      'Category created via API',
      { categoryId: category.id },
      'InventoryController',
    );
    return category;
  }

  @Get('categories')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves all product categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getAllCategories() {
    return this.inventoryService.getAllCategories();
  }

  @Get('categories/:id')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a specific category by its unique identifier.',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategory(@Param('id') id: string) {
    return this.inventoryService.getCategory(id);
  }

  // Supplier endpoints
  @Post('suppliers')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new supplier',
    description: 'Creates a new supplier in the system for sourcing products.',
  })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    const supplier =
      await this.inventoryService.createSupplier(createSupplierDto);
    this.logger.info(
      'Supplier created via API',
      { supplierId: supplier.id },
      'InventoryController',
    );
    return supplier;
  }

  @Get('suppliers')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all suppliers',
    description: 'Retrieves all suppliers in the system.',
  })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async getAllSuppliers() {
    return this.inventoryService.getAllSuppliers();
  }

  @Get('suppliers/:id')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get supplier by ID',
    description: 'Retrieves a specific supplier by its unique identifier.',
  })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplier(@Param('id') id: string) {
    return this.inventoryService.getSupplier(id);
  }

  // Warehouse endpoints
  @Post('warehouses')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new warehouse',
    description: 'Creates a new warehouse location for storing inventory.',
  })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  async createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    const warehouse =
      await this.inventoryService.createWarehouse(createWarehouseDto);
    this.logger.info(
      'Warehouse created via API',
      { warehouseId: warehouse.id },
      'InventoryController',
    );
    return warehouse;
  }

  @Get('warehouses')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all warehouses',
    description: 'Retrieves all warehouse locations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
  })
  async getAllWarehouses() {
    return this.inventoryService.getAllWarehouses();
  }

  @Get('warehouses/:id')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get warehouse by ID',
    description: 'Retrieves a specific warehouse by its unique identifier.',
  })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async getWarehouse(@Param('id') id: string) {
    return this.inventoryService.getWarehouse(id);
  }

  // Inventory level endpoints
  @Get('levels/product/:productId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get inventory levels by product',
    description:
      'Retrieves inventory levels across all warehouses for a specific product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory levels retrieved successfully',
  })
  async getInventoryByProduct(@Param('productId') productId: string) {
    return this.inventoryService.getInventoryByProduct(productId);
  }

  @Get('levels/warehouse/:warehouseId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get inventory levels by warehouse',
    description:
      'Retrieves inventory levels for all products in a specific warehouse.',
  })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory levels retrieved successfully',
  })
  async getInventoryByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.inventoryService.getInventoryByWarehouse(warehouseId);
  }

  @Get('levels/low-stock')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get low stock items',
    description:
      'Retrieves inventory items that are below their reorder point.',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
  })
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('levels/:productId/:warehouseId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get specific inventory level',
    description:
      'Retrieves inventory level for a specific product in a specific warehouse.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory level retrieved successfully',
  })
  async getInventoryLevel(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.inventoryService.getInventoryLevel(productId, warehouseId);
  }

  // Stock movement endpoints
  @Post('stock/update')
  @Roles(Role.STAFF, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update stock levels',
    description:
      'Records a stock movement and updates inventory levels accordingly.',
  })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 409, description: 'Insufficient stock for operation' })
  async updateStock(@Body() updateStockDto: UpdateStockDto) {
    await this.inventoryService.updateStock(updateStockDto);
    this.logger.info(
      'Stock updated via API',
      {
        productId: updateStockDto.productId,
        warehouseId: updateStockDto.warehouseId,
        movementType: updateStockDto.movementType,
        quantity: updateStockDto.quantity,
      },
      'InventoryController',
    );
    return { message: 'Stock updated successfully' };
  }

  @Post('stock/adjust')
  @Roles(Role.STAFF, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust inventory levels',
    description:
      'Manually adjusts inventory to a specific quantity (e.g., after physical count).',
  })
  @ApiBody({ type: AdjustInventoryDto })
  @ApiResponse({ status: 200, description: 'Inventory adjusted successfully' })
  async adjustInventory(@Body() adjustInventoryDto: AdjustInventoryDto) {
    await this.inventoryService.adjustInventory(adjustInventoryDto);
    this.logger.info(
      'Inventory adjusted via API',
      {
        productId: adjustInventoryDto.productId,
        warehouseId: adjustInventoryDto.warehouseId,
        newQuantity: adjustInventoryDto.newQuantity,
      },
      'InventoryController',
    );
    return { message: 'Inventory adjusted successfully' };
  }

  @Get('movements/product/:productId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get stock movements by product',
    description: 'Retrieves stock movement history for a specific product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock movements retrieved successfully',
  })
  async getStockMovements(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getStockMovements(productId, limit);
  }

  @Get('movements/warehouse/:warehouseId')
  @Roles(Role.USER, Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get stock movements by warehouse',
    description: 'Retrieves stock movement history for a specific warehouse.',
  })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock movements retrieved successfully',
  })
  async getWarehouseMovements(
    @Param('warehouseId') warehouseId: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getWarehouseMovements(warehouseId, limit);
  }

  // Update endpoints
  @Put('products/:id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates an existing product with new information.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'SKU conflict' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.inventoryService.updateProduct(
      id,
      updateProductDto,
    );
    this.logger.info(
      'Product updated via API',
      { productId: id },
      'InventoryController',
    );
    return product;
  }

  @Put('categories/:id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category with new information.',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.inventoryService.updateCategory(
      id,
      updateCategoryDto,
    );
    this.logger.info(
      'Category updated via API',
      { categoryId: id },
      'InventoryController',
    );
    return category;
  }

  @Put('suppliers/:id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Update supplier',
    description: 'Updates an existing supplier with new information.',
  })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    const supplier = await this.inventoryService.updateSupplier(
      id,
      updateSupplierDto,
    );
    this.logger.info(
      'Supplier updated via API',
      { supplierId: id },
      'InventoryController',
    );
    return supplier;
  }

  @Put('warehouses/:id')
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Update warehouse',
    description: 'Updates an existing warehouse with new information.',
  })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiBody({ type: UpdateWarehouseDto })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async updateWarehouse(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    const warehouse = await this.inventoryService.updateWarehouse(
      id,
      updateWarehouseDto,
    );
    this.logger.info(
      'Warehouse updated via API',
      { warehouseId: id },
      'InventoryController',
    );
    return warehouse;
  }

  // Delete endpoints
  @Delete('products/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product',
    description:
      'Deletes a product. Soft delete if inventory exists, hard delete otherwise.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string) {
    await this.inventoryService.deleteProduct(id);
    this.logger.info(
      'Product deleted via API',
      { productId: id },
      'InventoryController',
    );
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a category. Fails if it has associated products.',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Category has associated products',
  })
  async deleteCategory(@Param('id') id: string) {
    await this.inventoryService.deleteCategory(id);
    this.logger.info(
      'Category deleted via API',
      { categoryId: id },
      'InventoryController',
    );
  }

  @Delete('suppliers/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete supplier',
    description:
      'Deletes a supplier. Soft delete if products exist, hard delete otherwise.',
  })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async deleteSupplier(@Param('id') id: string) {
    await this.inventoryService.deleteSupplier(id);
    this.logger.info(
      'Supplier deleted via API',
      { supplierId: id },
      'InventoryController',
    );
  }

  @Delete('warehouses/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete warehouse',
    description: 'Deletes a warehouse. Fails if it has inventory levels.',
  })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 204, description: 'Warehouse deleted successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  @ApiResponse({
    status: 409,
    description: 'Warehouse has inventory levels',
  })
  async deleteWarehouse(@Param('id') id: string) {
    await this.inventoryService.deleteWarehouse(id);
    this.logger.info(
      'Warehouse deleted via API',
      { warehouseId: id },
      'InventoryController',
    );
  }

  // Test endpoint for admin
  @Get('admin/test')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin test endpoint',
    description:
      'Simple test endpoint for admin users to verify inventory module functionality.',
  })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return {
      message: 'Inventory module is working correctly',
      timestamp: new Date().toISOString(),
      module: 'inventory',
    };
  }
}
