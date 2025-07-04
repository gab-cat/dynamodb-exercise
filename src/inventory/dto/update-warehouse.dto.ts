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
import { AddressDto } from './create-warehouse.dto';

export class UpdateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Distribution Center',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

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
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;
}
