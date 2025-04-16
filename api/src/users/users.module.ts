import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './user.repository';
import { FirebaseAuthService } from 'src/auth/firebase-auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, FirebaseAuthService],
  exports: [UsersService],
})
export class UsersModule {}
