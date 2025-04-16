import { Injectable } from '@nestjs/common';
import { CreateUserInterface } from '../interfaces/create-user-account.interface';
import firebaseAdminApp from 'firebase.initialization';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class FirebaseAuthService {
  async createUserAccount(user: CreateUserInterface): Promise<UserRecord> {
    const newUserAccount = {
      displayName: user.name,
      email: user.email,
      password: user.password,
      emailVerified: false,
      disabled: false,
    };

    try {
      const userRecord: UserRecord = await firebaseAdminApp
        .auth()
        .createUser(newUserAccount);
      console.log('Successfully created new user account:', userRecord.uid);
      return userRecord;
    } catch (error) {
      console.log('Error creating new user:', error);
    }
  }

  async deleteUserAccount(uid) {
    try {
      await firebaseAdminApp.auth().deleteUser(uid);
      console.log(`Usuario ${uid} exluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  }
}
