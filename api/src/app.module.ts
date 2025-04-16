import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GoogleSheetsService } from './google-sheets/google-sheets.service';
import { GoogleSheetsController } from './google-sheets/google-sheets.controller';
import { MepModule } from './mep/mep.module';
import { FirebaseAuthStrategy } from './auth/firebase.strategy';
import { HelloModule } from './hello/hello.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MepModule,
    HelloModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: 465, // 587 for unencrypted/TLS connections, 465 for SSL connections
        secure: true, // false for TLS, true for SSL
        auth: {
          user: 'apikey',
          pass: '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',
        },
      },
    }),
    /*TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'FTS_teste',
      entities: [Mep],
      synchronize: false,
    }),*/
  ],
  controllers: [AppController, GoogleSheetsController],
  providers: [AppService, GoogleSheetsService, FirebaseAuthStrategy],
})
export class AppModule {}
