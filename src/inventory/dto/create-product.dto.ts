import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDimensionsDto {
  @ApiProperty({
    description: 'Product length in inches',
    example: 12.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Length must be a valid number' })
  @IsPositive({ message: 'Length must be positive' })
  length?: number;

  @ApiProperty({
    description: 'Product width in inches',
    example: 8.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Width must be a valid number' })
  @IsPositive({ message: 'Width must be positive' })
  width?: number;

  @ApiProperty({
    description: 'Product height in inches',
    example: 6.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Height must be a valid number' })
  @IsPositive({ message: 'Height must be positive' })
  height?: number;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Wireless Headphones',
  })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Stock Keeping Unit (SKU)',
    example: 'WH-1000XM4',
  })
  @IsString({ message: 'SKU must be a string' })
  sku: string;

  @ApiProperty({
    description: 'Category ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8X',
  })
  @IsString({ message: 'Category ID must be a string' })
  categoryId: string;

  @ApiProperty({
    description: 'Supplier ID',
    example: '01HK9Z8XQJP2YV3T4Q5R6S7W8Y',
  })
  @IsString({ message: 'Supplier ID must be a string' })
  supplierId: string;

  @ApiProperty({
    description: 'Unit price in dollars',
    example: 299.99,
  })
  @IsNumber({}, { message: 'Unit price must be a valid number' })
  @IsPositive({ message: 'Unit price must be positive' })
  unitPrice: number;

  @ApiProperty({
    description: 'Unit cost in dollars',
    example: 150.0,
  })
  @IsNumber({}, { message: 'Unit cost must be a valid number' })
  @IsPositive({ message: 'Unit cost must be positive' })
  unitCost: number;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 10,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum stock must be a valid number' })
  @Min(0, { message: 'Minimum stock cannot be negative' })
  minimumStock?: number;

  @ApiProperty({
    description: 'Maximum stock level',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum stock must be a valid number' })
  @IsPositive({ message: 'Maximum stock must be positive' })
  maximumStock?: number;

  @ApiProperty({
    description: 'Product weight in pounds',
    example: 0.75,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a valid number' })
  @IsPositive({ message: 'Weight must be positive' })
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions',
    type: ProductDimensionsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Product tags for search and categorization',
    example: ['wireless', 'electronics', 'audio'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
