import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { MovementType } from '../models/inventory.types';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Product ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8X',
  })
  @IsString({ message: 'Product ID must be a string' })
  productId: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8Y',
  })
  @IsString({ message: 'Warehouse ID must be a string' })
  warehouseId: string;

  @ApiProperty({
    description: 'Type of stock movement',
    enum: MovementType,
    example: MovementType.RECEIPT,
  })
  @IsEnum(MovementType, { message: 'Movement type must be a valid value' })
  movementType: MovementType;

  @ApiProperty({
    description:
      'Quantity to move (positive for inbound, negative for outbound)',
    example: 50,
  })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  quantity: number;

  @ApiProperty({
    description: 'Unit cost for this movement',
    example: 25.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Unit cost must be a valid number' })
  @IsPositive({ message: 'Unit cost must be positive' })
  unitCost?: number;

  @ApiProperty({
    description: 'Reference type for this movement',
    example: 'PURCHASE_ORDER',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Reference type must be a string' })
  referenceType?: string;

  @ApiProperty({
    description: 'Reference ID for this movement',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8Z',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Reference ID must be a string' })
  referenceId?: string;

  @ApiProperty({
    description: 'Notes about this stock movement',
    example: 'Received shipment from supplier',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiProperty({
    description: 'User performing the stock movement',
    example: 'john.doe@company.com',
  })
  @IsString({ message: 'Performed by must be a string' })
  performedBy: string;
}

export class AdjustInventoryDto {
  @ApiProperty({
    description: 'Product ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8X',
  })
  @IsString({ message: 'Product ID must be a string' })
  productId: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8Y',
  })
  @IsString({ message: 'Warehouse ID must be a string' })
  warehouseId: string;

  @ApiProperty({
    description: 'New quantity on hand',
    example: 100,
  })
  @IsNumber({}, { message: 'New quantity must be a valid number' })
  @IsPositive({ message: 'New quantity must be positive' })
  newQuantity: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Physical count adjustment',
  })
  @IsString({ message: 'Notes must be a string' })
  notes: string;

  @ApiProperty({
    description: 'User performing the adjustment',
    example: 'john.doe@company.com',
  })
  @IsString({ message: 'Performed by must be a string' })
  performedBy: string;
}
