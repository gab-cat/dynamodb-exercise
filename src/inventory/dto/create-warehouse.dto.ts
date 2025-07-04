import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Warehouse Drive',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  street?: string;

  @ApiProperty({
    description: 'City',
    example: 'San Francisco',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @ApiProperty({
    description: 'State or province',
    example: 'CA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @ApiProperty({
    description: 'ZIP or postal code',
    example: '94105',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'ZIP code must be a string' })
  zipCode?: string;

  @ApiProperty({
    description: 'Country',
    example: 'US',
    default: 'US',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;
}

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Distribution Center',
  })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Warehouse address',
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Warehouse capacity in square feet',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a valid number' })
  @IsPositive({ message: 'Capacity must be positive' })
  capacity?: number;

  @ApiProperty({
    description: 'Whether the warehouse is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;
}
