import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WebhookDTO } from './dto/webHook.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get(':uid')
  async getUserByUid(@Param('uid') uid: string) {
    return await this.usersService.getUserByUid(uid);
  }

  @Post('create')
  async create(@Body() createMepDto: CreateUserDto) {
    try {
      this.usersService.createUserInFirebase(createMepDto);
    } catch (error) {
      return new HttpException(error, 400);
    }
  }

  @Post('createFromKiwify')
  async createFromKiwify(@Body() WebhookDTO: WebhookDTO) {
    try {
      this.usersService.createUserInFirebaseFromKiwify(WebhookDTO);
      return {
        message: 'Operação concluída com sucesso',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return new HttpException(error, 400);
    }
  }
}
