import { Controller, Get, Post, Body } from '@nestjs/common';
import { HelloService } from './hello.service';
import { UpdateCheckClassDto } from './dto/update-check-class.dto';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get('hello')
  hello() {
    return 'Hello World';
  }

  @Post('update')
  update(@Body() updateCheckClassDto: UpdateCheckClassDto) {
    return this.helloService.update(updateCheckClassDto);
  }
}
