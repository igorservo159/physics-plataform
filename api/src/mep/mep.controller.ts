import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  UseGuards,
  Request,
  Param,
  Get,
  Res,
  Delete,
} from '@nestjs/common';
import { MepService } from './mep.service';
import { CreateMepDto } from './dto/create-mep.dto';
import { ValidateMepDatesPipe } from 'src/pipes/ValidationMepDates.pipe';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('mep')
export class MepController {
  constructor(
    private readonly mepService: MepService,
    private readonly pdfService: PdfService,
  ) { }

  @Post('create')
  @UsePipes(new ValidateMepDatesPipe())
  async create(@Body() createMepDto: CreateMepDto) {
    console.log(createMepDto);
    try {
      return this.mepService.createMep(createMepDto);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('createAndSave')
  @UsePipes(new ValidateMepDatesPipe())
  async createAndSave(@Request() req, @Body() createMepDto: CreateMepDto) {
    createMepDto.uid = req.user.uid;
    try {
      return await this.mepService.createMepAndSave(createMepDto);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('getRecommendedLessons')
  @UsePipes(new ValidateMepDatesPipe())
  async createClassesArray(@Request() req, @Body() createMepDto: CreateMepDto) {
    //createMepDto.uid = req.user.uid;
    try {
      return this.mepService.createRecommendedClassesArray(createMepDto);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('markLessons')
  @UsePipes(new ValidateMepDatesPipe())
  async markLessons(
    @Request() req,
    @Body('fullMepId') fullMepId: string,
    @Body('day') day: number,
    @Body('lesson') lesson: number,
  ) {
    //createMepDto.uid = req.user.uid;
    try {
      return this.mepService.markLessons(req.user.uid, fullMepId, day, lesson);
    } catch (error) {
      return new HttpException(error, 402);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('minimal')
  @UsePipes(new ValidateMepDatesPipe())
  async getMinimalMeps(@Request() req) {
    try {
      return await this.mepService.getAllMinimalMepsByUid(req.user.uid);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('full/:id') // Define uma rota GET com um parâmetro de rota ':id'
  @UsePipes(new ValidateMepDatesPipe())
  async getAFullMepById(@Param('id') id: string) {
    try {
      return await this.mepService.getAFullMepById(id);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('minimal/:id') // Define uma rota GET com um parâmetro de rota ':id'
  @UsePipes(new ValidateMepDatesPipe())
  async getAMinimalMepById(@Param('id') id: string) {
    try {
      return await this.mepService.getAMinimalMepById(id);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('fullByMinimal/:id') // Define uma rota GET com um parâmetro de rota ':id'
  @UsePipes(new ValidateMepDatesPipe())
  async getAFullMepLinkedToAMinimalMep(@Param('id') id: string) {
    try {
      return await this.mepService.getAFullMepLinkedToAMinimalMep(id);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('classesOf/:id') // Define uma rota GET com um parâmetro de rota ':id'
  @UsePipes(new ValidateMepDatesPipe())
  async getTestes(@Param('id') id: string) {
    try {
      return await this.mepService.getAllClassesOfAMepById(id);
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('generatePdf/:id')
  async generatePdf(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const newPdfBytes = await this.pdfService.createPDF({
      fullMepId: id,
      user: req.user,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=meu_pdf.pdf');
    res.send(Buffer.from(newPdfBytes));
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('/:id') // Define uma rota GET com um parâmetro de rota ':id'
  @UsePipes(new ValidateMepDatesPipe())
  async deleteMepById(@Request() req, @Param('id') id: string) {
    try {
      return await this.mepService.deleteMepById({
        uid: req.user.uid,
        mepId: id,
      });
    } catch (error) {
      return new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }
}
