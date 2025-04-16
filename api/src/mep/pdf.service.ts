import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import { MepService } from './mep.service';
import { differenceInWeeks } from 'date-fns';
import firebaseAdminApp from 'firebase.initialization';

@Injectable()
export class PdfService {
  constructor(private readonly mepService: MepService) { }
  async createPDF({ fullMepId, user }): Promise<Uint8Array> {

    const snapshot = await firebaseAdminApp
      .firestore()
      .collection('USERS_COLLECTION')
      .where('uidAuthRef', '==', user.uid)
      .get();

    user = snapshot.docs[0].data()

    console.log(user)

    const mepExample = await this.mepService.getAFullMepById(fullMepId);

    const classesPerDay = mepExample.classesPerDay;

    const numberOfDays = mepExample.schedule.length;

    const numberOfWeeks = differenceInWeeks(
      mepExample.endDate,
      mepExample.startDate,
    );

    const pdfDoc = await PDFDocument.create();

    const helveticaFontBold = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold,
    );
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const capaFilePath = 'pdfs/capa.pdf';
    const capaPdfBytes = fs.readFileSync(capaFilePath);
    const capaPDF = await PDFDocument.load(capaPdfBytes);

    const folhaFilePath = 'pdfs/folha_helv.pdf';
    const folhaPdfBytes = fs.readFileSync(folhaFilePath);
    const folhaPDF = await PDFDocument.load(folhaPdfBytes);

    const lessonsFilePath = `pdfs/${classesPerDay}aulas.pdf`;
    const lessonsPdfBytes = fs.readFileSync(lessonsFilePath);
    const lessonsPDF = await PDFDocument.load(lessonsPdfBytes);

    const [capaPDFPage] = await pdfDoc.copyPages(capaPDF, [0]);
    const [folhaPDFPage] = await pdfDoc.copyPages(folhaPDF, [0]);

    pdfDoc.addPage(capaPDFPage);
    pdfDoc.addPage(folhaPDFPage);

    const page2 = pdfDoc.getPage(1);
    const fontSize = 19;
    const text = '01';
    const { width, height } = page2.getSize();
    const textX = width * 0.883;
    const textY = height * 0.072;
    page2.drawText(text, {
      x: textX,
      y: textY,
      size: fontSize,
      font: helveticaFontBold,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(user.name, {
      x: width * 0.155,
      y: height * 0.8528,
      size: 12,
      font: helveticaFont,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(`${numberOfWeeks} semanas`, {
      x: width * 0.367,
      y: height * 0.4415,
      size: 12,
      font: helveticaFont,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(`${mepExample.hoursPerDay} horas`, {
      x: width * 0.436,
      y: height * 0.422,
      size: 12,
      font: helveticaFont,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(`EMAIL: ${user.email}`, {
      x: 0.1 * width,
      y: 0.063 * height,
      size: 12,
      font: helveticaFont,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(`MEP: ${fullMepId}`, {
      x: 0.1 * width,
      y: 0.04 * height,
      size: 12,
      font: helveticaFont,
      color: rgb(0.15686, 0.23922, 0.24314),
    });

    page2.drawText(`EMAIL: ${user.email}`, {
      x: 0.2 * width,
      y: 0.96 * height,
      size: 8,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });

    page2.drawText(`MEP: ${fullMepId}`, {
      x: 0.2 * width,
      y: 0.95 * height,
      size: 8,
      font: helveticaFont,
      color: rgb(1, 1, 1),
    });

    for (let i = 2; i < numberOfDays + 2; i++) {
      const [lessonPDFPage] = await pdfDoc.copyPages(lessonsPDF, [0]);
      pdfDoc.addPage(lessonPDFPage);

      const pagei = pdfDoc.getPage(i);
      const { width, height } = pagei.getSize();
      const indiceFontSize = 19;

      pagei.drawText(`EMAIL: ${user.email}`, {
        x: 0.1 * width,
        y: 0.063 * height,
        size: 12,
        font: helveticaFont,
        color: rgb(0.15686, 0.23922, 0.24314),
      });

      pagei.drawText(`MEP: ${fullMepId}`, {
        x: 0.1 * width,
        y: 0.04 * height,
        size: 12,
        font: helveticaFont,
        color: rgb(0.15686, 0.23922, 0.24314),
      });

      pagei.drawText(`EMAIL: ${user.email}`, {
        x: 0.2 * width,
        y: 0.96 * height,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 1, 1),
      });

      pagei.drawText(`MEP: ${fullMepId}`, {
        x: 0.2 * width,
        y: 0.95 * height,
        size: 8,
        font: helveticaFont,
        color: rgb(1, 1, 1),
      });

      const indice = `${i}`.padStart(2, '0');
      const indiceX = width * 0.883;
      const indiceY = height * 0.072;
      pagei.drawText(indice, {
        x: indiceX,
        y: indiceY,
        size: indiceFontSize,
        font: helveticaFontBold,
        color: rgb(0.15686, 0.23922, 0.24314),
      });

      const dayFontSize = 27;
      const day = `${mepExample.schedule[i - 2].date.slice(0, 5)}`;
      const dayX = width * 0.119;
      const dayY = height * 0.88;
      pagei.drawText(day, {
        x: dayX,
        y: dayY,
        size: dayFontSize,
        font: helveticaFontBold,
        color: rgb(0.15686, 0.23922, 0.24314),
      });

      const weekDayFontSize = 25;
      const weekDay = `${mepExample.schedule[i - 2].date.slice(8)}`;
      const weekDayX = width * 0.3;
      const weekDayY = height * 0.88;
      pagei.drawText(weekDay, {
        x: weekDayX,
        y: weekDayY,
        size: weekDayFontSize,
        font: helveticaFontBold,
        color: rgb(0.15686, 0.23922, 0.24314),
      });

      const lessonFontSize = 13;
      const lessonX = width * 0.13;
      const lastDayLessonsNumber =
        mepExample.schedule[numberOfDays - 1].classes.length;
      if (i == numberOfDays + 1) {
        for (let j = 0; j < lastDayLessonsNumber; j++) {
          const lesson = `${mepExample.schedule[i - 2].classes[j].name}`;
          const lessonY = height * (0.796 - 0.0505 * j);
          pagei.drawText(lesson, {
            x: lessonX,
            y: lessonY,
            size: lessonFontSize,
            font: helveticaFont,
            color: rgb(0.15686, 0.23922, 0.24314),
          });
        }
        const tarefa1 = 'Refaça os exemplos resolvidos';
        const tarefa1Y = height * (0.796 - 0.0505 * lastDayLessonsNumber);
        pagei.drawText(tarefa1, {
          x: lessonX,
          y: tarefa1Y,
          size: lessonFontSize,
          font: helveticaFont,
          color: rgb(0.15686, 0.23922, 0.24314),
        });
        const tarefa2 = 'Inicie a lista de exercícios';
        const tarefa2Y = height * (0.796 - 0.0505 * (lastDayLessonsNumber + 1));
        pagei.drawText(tarefa2, {
          x: lessonX,
          y: tarefa2Y,
          size: lessonFontSize,
          font: helveticaFont,
          color: rgb(0.15686, 0.23922, 0.24314),
        });
      } else {
        for (let j = 0; j < classesPerDay; j++) {
          const lesson = `${mepExample.schedule[i - 2].classes[j].name}`;
          const lessonY = height * (0.796 - 0.0505 * j);
          pagei.drawText(lesson, {
            x: lessonX,
            y: lessonY,
            size: lessonFontSize,
            font: helveticaFont,
            color: rgb(0.15686, 0.23922, 0.24314),
          });
        }
        const tarefa1 = 'Refaça os exemplos resolvidos';
        const tarefa1Y = height * (0.796 - 0.0505 * classesPerDay);
        pagei.drawText(tarefa1, {
          x: lessonX,
          y: tarefa1Y,
          size: lessonFontSize,
          font: helveticaFont,
          color: rgb(0.15686, 0.23922, 0.24314),
        });
        const tarefa2 = 'Inicie a lista de exercícios';
        const tarefa2Y = height * (0.796 - 0.0505 * (classesPerDay + 1));
        pagei.drawText(tarefa2, {
          x: lessonX,
          y: tarefa2Y,
          size: lessonFontSize,
          font: helveticaFont,
          color: rgb(0.15686, 0.23922, 0.24314),
        });
      }
    }

    return await pdfDoc.save();
  }
}
