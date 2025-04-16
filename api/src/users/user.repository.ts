import { Injectable } from '@nestjs/common';
import { FirestoreDocUserInterface } from './interfaces/firestore-doc-user.interface';
import firebaseAdminApp from 'firebase.initialization';

const USERS_COLLECTION_NAME = 'USERS_COLLECTION';

@Injectable()
export class UsersRepository {
  async createUser(user: FirestoreDocUserInterface): Promise<string> {
    try {
      const documentReference = await firebaseAdminApp
        .firestore()
        .collection(USERS_COLLECTION_NAME)
        .add(user);
      return documentReference.id;
    } catch (error) {
      console.log('Ocorreu um erro ao tentar criar um novo usuário');
      throw error;
    }
  }

  async getUserByEmail(
    email: string,
  ): Promise<FirestoreDocUserInterface | undefined> {
    const snapshot = await firebaseAdminApp
      .firestore()
      .collection(USERS_COLLECTION_NAME)
      .where('email', '==', email)
      .get();

    const docs = await snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as FirestoreDocUserInterface,
    );

    if (docs.length > 0) {
      return docs[0];
    } else {
      return undefined;
    }
  }

  async getUserByUid(
    uid: string,
  ): Promise<FirestoreDocUserInterface | undefined> {
    const snapshot = await firebaseAdminApp
      .firestore()
      .collection(USERS_COLLECTION_NAME)
      .where('uidAuthRef', '==', uid)
      .get();

    const docs = await snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as FirestoreDocUserInterface,
    );

    if (docs.length > 0) {
      return docs[0];
    } else {
      return undefined;
    }
  }

  async getUserById(
    uid: string,
  ): Promise<FirestoreDocUserInterface | undefined> {
    try {
      const snapshot = await firebaseAdminApp
        .firestore()
        .collection(USERS_COLLECTION_NAME)
        .doc(uid)
        .get();

      if (snapshot.exists) {
        return {
          ...snapshot.data(),
          id: snapshot.id,
        } as FirestoreDocUserInterface;
      }
      return undefined;
    } catch (error) {
      console.log(
        `Erro ao tentar encontrar um usuário por UID na coleção ${USERS_COLLECTION_NAME}`,
      );
      throw error;
    }
  }

  async getAllUsers(): Promise<FirestoreDocUserInterface[]> {
    const collectionSnapshot = await firebaseAdminApp
      .firestore()
      .collection(USERS_COLLECTION_NAME)
      .get();
    return collectionSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id }) as FirestoreDocUserInterface,
    );
  }

  async deleteUserById(id: string) {
    await firebaseAdminApp
      .firestore()
      .collection(USERS_COLLECTION_NAME)
      .doc(id)
      .delete();
  }

  async deleteUserByEmail(email: string) {
    try {
      const { id } = await this.getUserByEmail(email);

      if (id) {
        this.deleteUserById(id);
      }
    } catch (error) {
      console.log('Ocorreu um erro ao tentar deletar um usuário por email');
      throw error;
    }
  }

  async updateFieldValue(id: string, fieldName: string, value: any) {
    const docRef = await firebaseAdminApp
      .firestore()
      .collection(USERS_COLLECTION_NAME)
      .doc(id);

    try {
      await docRef.update({ [fieldName]: value });
    } catch (error) {
      console.error(`Erro ao atualizar campo: ${fieldName}`, error);
      throw error;
    }
  }

  async setActivedMepsValueOfAUserById(id: string, n: number) {
    const field: string = 'activedMeps';
    try {
      this.updateFieldValue(id, 'activedMeps', n);
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por Id`,
      );
    }
  }

  async setActivedMepsValueOfAUserByEmail(email: string, n: number) {
    const field: string = 'activedMeps';
    try {
      const { id } = await this.getUserByEmail(email);

      if (id) {
        this.updateFieldValue(id, field, n);
      }
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por email`,
      );
      throw error;
    }
  }

  async setNameOfAUserById(id: string, newName: string) {
    const field: string = 'name';
    try {
      this.updateFieldValue(id, field, newName);
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por id`,
      );
      throw error;
    }
  }

  async setNameOfAUserByEmail(email: string, newName: string) {
    const field: string = 'name';
    try {
      const { id } = await this.getUserByEmail(email);

      if (id) {
        this.updateFieldValue(id, field, newName);
      }
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por email`,
      );
      throw error;
    }
  }

  async setCpfOfAUserByEmail(email: string, cpf: string) {
    const field: string = 'cpf';
    try {
      const { id } = await this.getUserByEmail(email);

      if (id) {
        this.updateFieldValue(id, field, cpf);
      }
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por email`,
      );
      throw error;
    }
  }

  async setCpfOfAUserById(id: string, cpf: string) {
    const field: string = 'name';
    try {
      this.updateFieldValue(id, field, cpf);
    } catch (error) {
      console.log(
        `Ocorreu um erro ao tentar fazer update do valor do campo ${field} por id`,
      );
      throw error;
    }
  }

  async inrementActivedMepsById(id: string) {
    const user = await this.getUserById(id);
    this.setActivedMepsValueOfAUserById(id, user.activedMeps + 1);
  }

  async inrementActivedMepsByUid(uid: string) {
    const user = await this.getUserByUid(uid);
    this.setActivedMepsValueOfAUserById(user.id, user.activedMeps + 1);
  }

  async decrementActivedMepsByUid(uid: string) {
    const user = await this.getUserByUid(uid);
    if (user.activedMeps <= 0) {
      throw Error('activedMeps já é = 0');
    }
    this.setActivedMepsValueOfAUserById(user.id, user.activedMeps - 1);
  }
}
