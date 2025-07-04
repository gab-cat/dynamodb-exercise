import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { DynamoDBModule } from './common/dynamodb/dynamodb.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InventoryModule } from './inventory/inventory.module';
import { LogsController } from './common/logger/logger.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMITING } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'login-attempts',
        ttl: RATE_LIMITING.THROTTLE.LOGIN_ATTEMPTS.TTL,
        limit: RATE_LIMITING.THROTTLE.LOGIN_ATTEMPTS.LIMIT,
      },
    ]),
    PrismaModule,
    DynamoDBModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    InventoryModule,
  ],
  controllers: [AppController, LogsController],
  providers: [AppService],
})
export class AppModule {}
