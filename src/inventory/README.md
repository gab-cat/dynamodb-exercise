# Product Inventory Module

A comprehensive inventory management system built with **DynamoDB OneTable** for efficient single-table design, providing real-world inventory operations with proper access patterns and business logic.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [Access Patterns](#access-patterns)
- [API Endpoints](#api-endpoints)
- [Environment Setup](#environment-setup)
- [Usage Examples](#usage-examples)
- [Business Logic](#business-logic)
- [Testing](#testing)

## Overview

This module implements a real-world inventory management system using DynamoDB's single-table design pattern. It supports:

- **Product Management**: Complete CRUD operations for products with rich metadata
- **Category Hierarchy**: Hierarchical product categorization with full CRUD support
- **Supplier Management**: Vendor information and sourcing details with complete lifecycle management
- **Multi-Warehouse Support**: Inventory tracking across multiple locations with full management capabilities
- **Stock Movement Tracking**: Complete audit trail of all inventory changes
- **Low Stock Alerts**: Automated detection of items below reorder points
- **Purchase Order Management**: Integration with procurement workflows
- **Smart Deletion**: Intelligent delete operations with referential integrity protection
- **Flexible Updates**: Partial updates for all entities with validation

## Architecture

### Single Table Design

The system uses a single DynamoDB table with the following structure:

```
Table: inventory-table
Primary Key: pk (Hash), sk (Sort)
GSI1: gsi1pk (Hash), gsi1sk (Sort)
GSI2: gsi2pk (Hash), gsi2sk (Sort)
```

### Access Patterns Supported

1. **Get product by ID** - `pk = PRODUCT#<id>`, `sk = METADATA`
2. **List products by category** - GSI1: `gsi1pk = CATEGORY#<categoryId>`
3. **List products by supplier** - GSI2: `gsi2pk = SUPPLIER#<supplierId>`
4. **Get inventory by product** - GSI1: `gsi1pk = PRODUCT#<productId>`
5. **Get inventory by warehouse** - `pk = WAREHOUSE#<warehouseId>`
6. **Find low stock items** - GSI2: `gsi2pk = LOW_STOCK`
7. **Get stock movements by product** - `pk = PRODUCT#<productId>`, `sk begins_with MOVEMENT#`
8. **Get movements by warehouse** - GSI1: `gsi1pk = WAREHOUSE#<warehouseId>`

## Data Models

### Update DTOs

For partial updates, the system provides dedicated DTOs that make all fields optional:

- `UpdateProductDto` - Partial product updates with SKU validation
- `UpdateCategoryDto` - Category information updates
- `UpdateSupplierDto` - Supplier contact and terms updates
- `UpdateWarehouseDto` - Warehouse location and capacity updates

All update DTOs support:

- **Partial Updates**: Only specify fields that need to change
- **Validation**: Same rules as create operations for provided fields
- **Type Safety**: Full TypeScript support with proper typing

### Product

```typescript
{
  id: string;           // ULID
  name: string;
  description?: string;
  sku: string;          // Unique identifier
  categoryId: string;
  supplierId: string;
  unitPrice: number;
  unitCost: number;
  minimumStock?: number;
  maximumStock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isActive: boolean;
  tags?: string[];
}
```

### Category

```typescript
{
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;  // For hierarchical categories
  isActive: boolean;
}
```

### Supplier

```typescript
{
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
  paymentTerms?: string;
  leadTimeDays?: number;
  isActive: boolean;
}
```

### Warehouse

```typescript
{
  id: string;
  name: string;
  address?: Address;
  capacity?: number;
  isActive: boolean;
}
```

### InventoryLevel

```typescript
{
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;    // Calculated field
  reorderPoint: number;
  reorderQuantity: number;
  lastStockCount?: Date;
  lastUpdated: Date;
}
```

### StockMovement

```typescript
{
  id: string;
  productId: string;
  warehouseId: string;
  movementType: 'RECEIPT' | 'SHIPMENT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
  quantity: number;             // Positive for inbound, negative for outbound
  previousQuantity: number;
  newQuantity: number;
  unitCost?: number;
  referenceType?: string;       // 'PURCHASE_ORDER', 'SALES_ORDER', etc.
  referenceId?: string;
  notes?: string;
  performedBy: string;
  timestamp: Date;
}
```

## API Endpoints

### Products

- `POST /inventory/products` - Create product
- `GET /inventory/products` - List all products
- `GET /inventory/products/:id` - Get product by ID
- `PUT /inventory/products/:id` - Update product
- `DELETE /inventory/products/:id` - Delete product (smart deletion)
- `GET /inventory/products/sku/:sku` - Find product by SKU
- `GET /inventory/products/category/:categoryId` - Get products by category
- `GET /inventory/products/supplier/:supplierId` - Get products by supplier

### Categories

- `POST /inventory/categories` - Create category
- `GET /inventory/categories` - List all categories
- `GET /inventory/categories/:id` - Get category by ID
- `PUT /inventory/categories/:id` - Update category
- `DELETE /inventory/categories/:id` - Delete category (protected deletion)

### Suppliers

- `POST /inventory/suppliers` - Create supplier
- `GET /inventory/suppliers` - List all suppliers
- `GET /inventory/suppliers/:id` - Get supplier by ID
- `PUT /inventory/suppliers/:id` - Update supplier
- `DELETE /inventory/suppliers/:id` - Delete supplier (smart deletion)

### Warehouses

- `POST /inventory/warehouses` - Create warehouse
- `GET /inventory/warehouses` - List all warehouses
- `GET /inventory/warehouses/:id` - Get warehouse by ID
- `PUT /inventory/warehouses/:id` - Update warehouse
- `DELETE /inventory/warehouses/:id` - Delete warehouse (protected deletion)

### Inventory Levels

- `GET /inventory/levels/product/:productId` - Get inventory by product
- `GET /inventory/levels/warehouse/:warehouseId` - Get inventory by warehouse
- `GET /inventory/levels/low-stock` - Get low stock items
- `GET /inventory/levels/:productId/:warehouseId` - Get specific inventory level

### Stock Operations

- `POST /inventory/stock/update` - Record stock movement
- `POST /inventory/stock/adjust` - Adjust inventory (manual correction)
- `GET /inventory/movements/product/:productId` - Get product movement history
- `GET /inventory/movements/warehouse/:warehouseId` - Get warehouse movement history

## Environment Setup

### Required Environment Variables

```bash
# DynamoDB Configuration
DYNAMODB_TABLE_NAME=inventory-table
DYNAMODB_ENDPOINT=http://localhost:8000  # For local development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key        # Optional for local
AWS_SECRET_ACCESS_KEY=your_secret_key    # Optional for local
```

### Local DynamoDB Setup

```bash
# Using Docker
docker run -p 8000:8000 amazon/dynamodb-local

# Or using AWS CLI to create table
aws dynamodb create-table \
  --table-name inventory-table \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=gsi1pk,AttributeType=S \
    AttributeName=gsi1sk,AttributeType=S \
    AttributeName=gsi2pk,AttributeType=S \
    AttributeName=gsi2sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=gsi1,KeySchema='[{AttributeName=gsi1pk,KeyType=HASH},{AttributeName=gsi1sk,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    IndexName=gsi2,KeySchema='[{AttributeName=gsi2pk,KeyType=HASH},{AttributeName=gsi2sk,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
```

## Usage Examples

### Creating a Complete Product Setup

```typescript
// 1. Create a category
const category = await inventoryService.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
});

// 2. Create a supplier
const supplier = await inventoryService.createSupplier({
  name: 'TechSource Inc.',
  contactEmail: 'orders@techsource.com',
  contactPhone: '+1-555-0123',
  address: {
    street: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'US',
  },
  paymentTerms: 'Net 30',
  leadTimeDays: 14,
});

// 3. Create a warehouse
const warehouse = await inventoryService.createWarehouse({
  name: 'Main Distribution Center',
  address: {
    street: '456 Warehouse Ave',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94601',
    country: 'US',
  },
  capacity: 50000,
});

// 4. Create a product
const product = await inventoryService.createProduct({
  name: 'Wireless Bluetooth Headphones',
  description: 'Premium noise-cancelling wireless headphones',
  sku: 'WBH-001',
  categoryId: category.id,
  supplierId: supplier.id,
  unitPrice: 199.99,
  unitCost: 89.99,
  minimumStock: 10,
  maximumStock: 500,
  weight: 0.6,
  dimensions: {
    length: 8.5,
    width: 7.0,
    height: 3.5,
  },
  tags: ['wireless', 'bluetooth', 'audio', 'electronics'],
});

// 5. Receive initial stock
await inventoryService.updateStock({
  productId: product.id,
  warehouseId: warehouse.id,
  movementType: MovementType.RECEIPT,
  quantity: 100,
  unitCost: 89.99,
  referenceType: 'PURCHASE_ORDER',
  referenceId: 'PO-001',
  notes: 'Initial stock receipt',
  performedBy: 'admin@company.com',
});
```

### Stock Operations

```typescript
// Ship products (outbound)
await inventoryService.updateStock({
  productId: product.id,
  warehouseId: warehouse.id,
  movementType: MovementType.SHIPMENT,
  quantity: -5, // Negative for outbound
  referenceType: 'SALES_ORDER',
  referenceId: 'SO-123',
  notes: 'Shipped to customer',
  performedBy: 'warehouse@company.com',
});

// Manual inventory adjustment after physical count
await inventoryService.adjustInventory({
  productId: product.id,
  warehouseId: warehouse.id,
  newQuantity: 93, // Actual count found 2 units missing
  notes: 'Physical count adjustment - found discrepancy',
  performedBy: 'inventory@company.com',
});

// Transfer between warehouses
await inventoryService.updateStock({
  productId: product.id,
  warehouseId: sourceWarehouse.id,
  movementType: MovementType.TRANSFER,
  quantity: -10, // Out of source
  referenceType: 'TRANSFER',
  referenceId: 'TR-001',
  notes: 'Transfer to secondary warehouse',
  performedBy: 'warehouse@company.com',
});

await inventoryService.updateStock({
  productId: product.id,
  warehouseId: targetWarehouse.id,
  movementType: MovementType.TRANSFER,
  quantity: 10, // Into target
  referenceType: 'TRANSFER',
  referenceId: 'TR-001',
  notes: 'Received from main warehouse',
  performedBy: 'warehouse@company.com',
});
```

### Querying Inventory Data

```typescript
// Get all products in a category
const electronicsProducts = await inventoryService.getProductsByCategory(
  category.id,
);

// Check current inventory levels for a product
const inventoryLevels = await inventoryService.getInventoryByProduct(
  product.id,
);

// Find items that need reordering
const lowStockItems = await inventoryService.getLowStockItems();

// Get movement history for audit
const movements = await inventoryService.getStockMovements(product.id, 20);
```

### Update and Delete Operations

```typescript
// Update product information
const updatedProduct = await inventoryService.updateProduct(product.id, {
  name: 'Updated Wireless Bluetooth Headphones',
  unitPrice: 249.99,
  minimumStock: 15,
  tags: ['wireless', 'bluetooth', 'audio', 'electronics', 'premium'],
});

// Update supplier contact information
const updatedSupplier = await inventoryService.updateSupplier(supplier.id, {
  contactEmail: 'newemail@techsource.com',
  contactPhone: '+1-555-0199',
  leadTimeDays: 10,
});

// Update warehouse capacity
const updatedWarehouse = await inventoryService.updateWarehouse(warehouse.id, {
  capacity: 75000,
  address: {
    street: '789 New Warehouse Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94601',
    country: 'US',
  },
});

// Delete operations with business logic protection
try {
  // This will soft-delete if inventory exists
  await inventoryService.deleteProduct(product.id);

  // This will fail if products are assigned to the category
  await inventoryService.deleteCategory(category.id);

  // This will soft-delete if products exist
  await inventoryService.deleteSupplier(supplier.id);

  // This will fail if inventory levels exist
  await inventoryService.deleteWarehouse(warehouse.id);
} catch (error) {
  console.log('Deletion protected by business rules:', error.message);
}
```

## Business Logic

### Stock Movement Rules

1. **Inbound Operations** (RECEIPT, RETURN):
   - Quantity must be positive
   - Increases `quantityOnHand`
   - Records movement with positive quantity

2. **Outbound Operations** (SHIPMENT, TRANSFER out):
   - Quantity must be negative
   - Decreases `quantityOnHand`
   - Cannot exceed available quantity
   - Records movement with negative quantity

3. **Adjustments**:
   - Sets `quantityOnHand` to specific value
   - Records difference as adjustment movement
   - Used for physical count corrections

### Update and Delete Operations

#### Update Rules

1. **Product Updates**:
   - SKU uniqueness validation on update
   - Partial updates supported for all fields
   - Automatic timestamp tracking

2. **Category Updates**:
   - Name and description updates allowed
   - Parent category relationships can be modified
   - Status changes (active/inactive)

3. **Supplier Updates**:
   - Contact information updates
   - Payment terms modifications
   - Lead time adjustments

4. **Warehouse Updates**:
   - Location and capacity changes
   - Address modifications
   - Status updates

#### Deletion Rules

1. **Smart Deletion for Products**:
   - **Soft Delete**: If inventory levels exist, product is marked as inactive
   - **Hard Delete**: If no inventory exists, product is permanently removed
   - Maintains data integrity and audit trail

2. **Protected Deletion for Categories**:
   - **Prevents deletion** if any products are assigned to the category
   - Returns conflict error with clear message
   - Ensures referential integrity

3. **Smart Deletion for Suppliers**:
   - **Soft Delete**: If products exist, supplier is marked as inactive
   - **Hard Delete**: If no products associated, supplier is permanently removed
   - Preserves historical supplier relationships

4. **Protected Deletion for Warehouses**:
   - **Prevents deletion** if any inventory levels exist in the warehouse
   - Returns conflict error with clear message
   - Ensures no orphaned inventory records

#### Access Control

- **Updates**: Require STAFF or ADMIN role
- **Deletions**: Require ADMIN role only
- **Role-based validation** on all operations
- **Audit logging** for all update and delete operations

### Low Stock Detection

Items are considered low stock when:

```
quantityOnHand <= reorderPoint
```

These items are automatically indexed in GSI2 for efficient querying.

### Audit Trail

Every stock change creates a `StockMovement` record containing:

- Before and after quantities
- Movement type and quantity
- Reference information (PO, SO, etc.)
- User who performed the action
- Timestamp for complete audit trail

## Testing

Run the inventory module tests:

```bash
# Unit tests
npm test -- inventory

# Coverage
npm run test:cov -- inventory

# Watch mode
npm run test:watch -- inventory
```

### Test Data Setup

The module includes test utilities for creating sample data:

```typescript
// Use the admin test endpoint to verify module functionality
GET / inventory / admin / test;
```

## Performance Considerations

### DynamoDB Optimization

1. **Single Table Design**: All entities in one table reduces costs and improves performance
2. **GSI Usage**: Strategic use of GSIs for common query patterns
3. **Compound Sort Keys**: Enable range queries and sorting
4. **Sparse Indexes**: GSI2 only contains low-stock items

### Caching Strategy

Consider implementing caching for:

- Product catalog data (rarely changes)
- Category hierarchies
- Supplier information
- Current inventory levels (with TTL)

### Monitoring

Key metrics to monitor:

- Read/write capacity consumption
- Query performance (especially GSI queries)
- Error rates on stock operations
- Low stock alert frequency

## Recent Updates

### v2.0 - Complete CRUD Operations (Latest)

- ✅ **Update Operations**: Full support for updating all entities
- ✅ **Delete Operations**: Smart deletion with business logic protection
- ✅ **Partial Updates**: Update only the fields you need
- ✅ **Referential Integrity**: Protected deletions prevent orphaned records
- ✅ **Role-Based Security**: Proper access control for all operations
- ✅ **Audit Trail**: Complete logging for all update and delete operations

### Key Improvements

1. **Smart Deletion Logic**:
   - Products and suppliers use soft delete when dependencies exist
   - Categories and warehouses use protected deletion to maintain integrity

2. **Flexible Updates**:
   - All entities support partial updates
   - Validation ensures data consistency
   - Automatic timestamp tracking

3. **Enhanced Security**:
   - Updates require STAFF/ADMIN roles
   - Deletions require ADMIN role only
   - Complete audit logging

## Future Enhancements

- **Purchase Order Management**: Full procurement workflow
- **Demand Forecasting**: ML-based reorder suggestions
- **Barcode Integration**: SKU scanning capabilities
- **Multi-Currency Support**: International supplier pricing
- **Batch Operations**: Bulk import/export functionality
- **Real-time Notifications**: WebSocket-based stock alerts
- **Advanced Reporting**: Business intelligence dashboards
- **Bulk Update Operations**: Update multiple entities at once
- **Version History**: Track changes over time for all entities
