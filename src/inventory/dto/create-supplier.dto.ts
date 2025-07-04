import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsEmail,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './create-warehouse.dto';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Supplier name',
    example: 'Acme Electronics Supply',
  })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'orders@acmeelectronics.com',
  })
  @IsEmail({}, { message: 'Contact email must be a valid email address' })
  contactEmail: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  contactPhone?: string;

  @ApiProperty({
    description: 'Supplier address',
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Payment terms',
    example: 'Net 30',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Payment terms must be a string' })
  paymentTerms?: string;

  @ApiProperty({
    description: 'Lead time in days',
    example: 14,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Lead time days must be a valid number' })
  @IsPositive({ message: 'Lead time days must be positive' })
  leadTimeDays?: number;

  @ApiProperty({
    description: 'Whether the supplier is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;
}
