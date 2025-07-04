import { Entity } from 'dynamodb-onetable';
import { InventorySchema } from './inventory.schema';

// Extract types from the OneTable schema
export type Product = Entity<typeof InventorySchema.models.Product>;
export type Category = Entity<typeof InventorySchema.models.Category>;
export type Supplier = Entity<typeof InventorySchema.models.Supplier>;
export type Warehouse = Entity<typeof InventorySchema.models.Warehouse>;
export type InventoryLevel = Entity<
  typeof InventorySchema.models.InventoryLevel
>;
export type PurchaseOrder = Entity<typeof InventorySchema.models.PurchaseOrder>;
export type PurchaseOrderItem = Entity<
  typeof InventorySchema.models.PurchaseOrderItem
>;
export type StockMovement = Entity<typeof InventorySchema.models.StockMovement>;

// Enums for better type safety
export enum MovementType {
  RECEIPT = 'RECEIPT',
  SHIPMENT = 'SHIPMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

// Additional types for business logic
export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface InventorySearchParams {
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface StockMovementSearchParams {
  productId?: string;
  warehouseId?: string;
  movementType?: MovementType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
