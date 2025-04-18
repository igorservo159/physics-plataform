import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserInterface } from 'src/interfaces/create-user-account.interface';
import { UsersRepository } from './user.repository';
import { FirestoreDocUserInterface } from './interfaces/firestore-doc-user.interface';
import { FirebaseAuthService } from 'src/auth/firebase-auth.service';
import { WebhookDTO } from './dto/webHook.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) { }
  async getUserByUid(uid: string): Promise<FirestoreDocUserInterface> {
    try {
      return this.userRepository.getUserByUid(uid);
    } catch (error) {
      console.log(
        'Erro (users.service) : erro ao tentar recuperar usuário por uid',
      );
      throw error;
    }
  }

  async getNumberOfMepsByUid(uid: string): Promise<number> {
    try {
      const user = await this.getUserByUid(uid);
      return user.activedMeps;
    } catch (error) {
      console.error(
        'Ocorreu um erro ao tentar pegar o número de meps por uid',
        error,
      );
    }
  }

  async getAllUsers(): Promise<FirestoreDocUserInterface[]> {
    try {
      return await this.userRepository.getAllUsers();
    } catch (error) {
      console.log(
        'Erro (users.service) : erro ao tentar recuperar todos os usuários',
      );
      throw error;
    }
  }

  async createUserInFirebase(createUserDto: CreateUserDto) {
    const newUserAccount: CreateUserInterface = {
      name: createUserDto.displayName,
      email: createUserDto.email,
      password: createUserDto.password,
    };

    const newAccountRecord =
      await this.firebaseAuthService.createUserAccount(newUserAccount);

    const newUser: FirestoreDocUserInterface = {
      name: createUserDto.displayName,
      email: createUserDto.email,
      cpf: '',
      activedMeps: 0,
      uidAuthRef: newAccountRecord.uid,
    };
    this.userRepository.createUser(newUser);
    return createUserDto;
  }

  async createUserInFirebaseFromKiwify(WebhookDTO: WebhookDTO) {

    const newUserAccount: CreateUserInterface = {
      name: WebhookDTO.Customer.first_name,
      email: WebhookDTO.Customer.email,
      password: '12345678',
    };

    const newAccountRecord =
      await this.firebaseAuthService.createUserAccount(newUserAccount);

    const newUser: FirestoreDocUserInterface = {
      name: WebhookDTO.Customer.first_name,
      email: WebhookDTO.Customer.email,
      cpf: WebhookDTO.Customer.CPF,
      activedMeps: 0,
      uidAuthRef: newAccountRecord.uid,
    };

    this.userRepository.createUser(newUser);
  }

  async inrementActivedMepsById(id: string) {
    await this.userRepository.inrementActivedMepsById(id);
  }

  async inrementActivedMepsByUid(uid: string) {
    await this.userRepository.inrementActivedMepsByUid(uid);
  }

  async decrementActivedMepsByUid(uid: string) {
    await this.userRepository.decrementActivedMepsByUid(uid);
  }
}
