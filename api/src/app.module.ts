import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoogleSheetsService } from './google-sheets/google-sheets.service';
import { GoogleSheetsController } from './google-sheets/google-sheets.controller';
import { MepModule } from './mep/mep.module';
import { FirebaseAuthStrategy } from './auth/firebase.strategy';
import { HelloModule } from './hello/hello.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env.dev',
    }),
    UsersModule,
    AuthModule,
    MepModule,
    HelloModule,
  ],
  controllers: [AppController, GoogleSheetsController],
  providers: [AppService, GoogleSheetsService, FirebaseAuthStrategy],
})
export class AppModule { }
