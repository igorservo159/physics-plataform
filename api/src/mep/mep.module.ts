import { Module } from '@nestjs/common';
import { MepService } from './mep.service';
import { MepController } from './mep.controller';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';
import { PdfService } from './pdf.service';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/user.repository';
import { FirebaseAuthService } from 'src/auth/firebase-auth.service';

@Module({
  controllers: [MepController],
  providers: [
    UsersRepository,
    FirebaseAuthService,
    MepService,
    GoogleSheetsService,
    PdfService,
    UsersService,
  ],
})
export class MepModule {}
