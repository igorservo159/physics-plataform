/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.dev' });
} else {
  dotenv.config({ path: '.env.prod' });
}

/* eslint-enable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { CreateMepDto } from './dto/create-mep.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';
import { differenceInWeeks } from 'date-fns';
import { readFileSync } from 'fs';
import firebaseAdminApp from 'firebase.initialization';
import { UsersService } from 'src/users/users.service';
import { error } from 'console';

interface MepClassesDetails {
  lessonsPerDay: number;
}

interface MepLogicScenario {
  weeksRange: [number, number];
  conditions: {
    daysPerWeek: number[];
    subconditions: {
      hoursPerDay: number[];
      classesPerDay: number;
    }[];
  }[];
}

type FullMepType = {
  id: string;
  uid: string;
  startDate: string;
  endDate: string;
  weekDays: number;
  entranceExam: string;
  hoursPerDay: number;
  schedule: any[];
  classesPerDay: number;
};

@Injectable()
export class MepService {
  constructor(
    private googleSheetsService: GoogleSheetsService,
    private readonly usersService: UsersService,
  ) { }

  async getAllClassesOfAMepById(id) {
    try {
      const db = firebaseAdminApp.firestore();
      const fullMepSnapshot = await db
        .collection('MEP_FULL_COLLECTION')
        .doc(id)
        .get();

      if (fullMepSnapshot.exists) {
        const schedule = fullMepSnapshot.data().schedule;
        const groupedClasses = schedule.map((day) => day.classes);
        const classes = [].concat(...groupedClasses);

        return classes;
      } else {
        // Documento não encontrado
        return null;
      }
    } catch (error) {
      console.error(
        'Ocorreu um erro ao tentar pegar todas as aulas de um mep de acordo com um mepId',
        error,
      );
      throw error;
    }
  }

  async createRecommendedClassesArray(createMepDto: CreateMepDto) {
    const previousClasses = new Set();

    if (createMepDto.previousMepReferences) {
      const refs = createMepDto.previousMepReferences;
      try {
        for (let i = 0; i < refs.length; i++) {
          (await this.getAllClassesOfAMepById(refs[i]))
            .filter((_class) => _class.check == true)
            .forEach((_class) => previousClasses.add(parseInt(_class.id)));
        }
      } catch (error) {
        console.error('Ocorreu um erro ao tentar receber aulas', error);
        throw error;
      }
    }

    const startDate = new Date(createMepDto.startDate);
    const endDate = new Date(createMepDto.endDate);
    const chosenDays = this.bitsToDays(createMepDto.weekDays);

    //criamos a estrutura no mep apenas com as datas.
    const mepScheduleStructure = this.createMepScheduleStructure(
      startDate,
      endDate,
      chosenDays,
    );

    //recuperamos todas as aulas de acordo com a sheet do exame específico passado pelo usuário.
    const entranceExamSheetName = createMepDto.entrance_exam;
    const service = this.googleSheetsService;
    const allLessons = await service.getFormatedData(entranceExamSheetName);

    //removemos as aulas já seleionadas
    const allLessonsReduced = allLessons.filter(
      (e) => !previousClasses.has(e.id),
    );

    //calculamos o número de semanas
    const weeksCount = this.countWeeksBetweenDates(startDate, endDate);

    //calculamos quantas aulas por dia e a relevancia mínima das aulas.
    const { lessonsPerDay } = this.createMepClassesDetails(
      weeksCount,
      chosenDays.length,
      createMepDto.hoursPerDay,
    );

    const recommendedLessonsCount = lessonsPerDay * mepScheduleStructure.length;
    const superHighRelevanceLessons = allLessonsReduced.filter(
      (lesson) => lesson.relevance == 4,
    );
    const highRelevanceLessons = allLessonsReduced.filter(
      (lesson) => lesson.relevance == 3,
    );
    const mediumRelevanceLessons = allLessonsReduced.filter(
      (lesson) => lesson.relevance == 2,
    );
    const lowRelevanceLessons = allLessonsReduced.filter(
      (lesson) => lesson.relevance == 1,
    );

    let recommendedLessons = [];

    if (superHighRelevanceLessons.length >= recommendedLessonsCount) {
      recommendedLessons = superHighRelevanceLessons.slice(
        0,
        recommendedLessonsCount,
      );
    } else if (
      superHighRelevanceLessons.length + highRelevanceLessons.length >=
      recommendedLessonsCount
    ) {
      const superHighLessonsCount = superHighRelevanceLessons.length;
      const highLessonsCount = recommendedLessonsCount - superHighLessonsCount;
      const classesPerFront = this.getClassesPerFront(
        highRelevanceLessons,
        highLessonsCount,
      );
      let highIterator = 0;
      let superHighIterator = 0;
      let AFrontIterator = 0;
      let BFrontIterator = 0;
      let CFrontIterator = 0;
      let DFrontIterator = 0;

      for (let i = 0; i < allLessonsReduced.length; i++) {
        const lesson = allLessonsReduced[i];
        if (
          (lesson.relevance === 3 && highIterator < highLessonsCount) ||
          (lesson.relevance === 4 && superHighIterator < superHighLessonsCount)
        ) {
          if (lesson.relevance === 3) {
            if (lesson.front == 1 && AFrontIterator < classesPerFront.frontA) {
              AFrontIterator++;
              highIterator++;
            } else if (
              lesson.front == 2 &&
              BFrontIterator < classesPerFront.frontB
            ) {
              BFrontIterator++;
              highIterator++;
            } else if (
              lesson.front == 3 &&
              CFrontIterator < classesPerFront.frontC
            ) {
              CFrontIterator++;
              highIterator++;
            } else if (
              lesson.front == 4 &&
              DFrontIterator < classesPerFront.frontD
            ) {
              DFrontIterator++;
              highIterator++;
            }
          } else if (lesson.relevance === 4) {
            superHighIterator++;
          }
          recommendedLessons.push(lesson);
        }
      }
    } else if (
      superHighRelevanceLessons.length +
      highRelevanceLessons.length +
      mediumRelevanceLessons.length >=
      recommendedLessonsCount
    ) {
      const superHighLessonsCount = superHighRelevanceLessons.length;
      const highLessonsCount = highRelevanceLessons.length;
      const mediumLessonsCount =
        recommendedLessonsCount - superHighLessonsCount - highLessonsCount;
      const classesPerFront = this.getClassesPerFront(
        mediumRelevanceLessons,
        mediumLessonsCount,
      );
      let mediumIterator = 0;
      let highIterator = 0;
      let superHighIterator = 0;
      let AFrontIterator = 0;
      let BFrontIterator = 0;
      let CFrontIterator = 0;
      let DFrontIterator = 0;

      for (let i = 0; i < allLessonsReduced.length; i++) {
        const lesson = allLessonsReduced[i];
        if (
          (lesson.relevance === 2 && mediumIterator < mediumLessonsCount) ||
          (lesson.relevance === 3 && highIterator < highLessonsCount) ||
          (lesson.relevance === 4 && superHighIterator < superHighLessonsCount)
        ) {
          if (lesson.relevance === 2) {
            if (lesson.front == 1 && AFrontIterator < classesPerFront.frontA) {
              AFrontIterator++;
              mediumIterator++;
            } else if (
              lesson.front == 2 &&
              BFrontIterator < classesPerFront.frontB
            ) {
              BFrontIterator++;
              mediumIterator++;
            } else if (
              lesson.front == 3 &&
              CFrontIterator < classesPerFront.frontC
            ) {
              CFrontIterator++;
              mediumIterator++;
            } else if (
              lesson.front == 4 &&
              DFrontIterator < classesPerFront.frontD
            ) {
              DFrontIterator++;
              mediumIterator++;
            }
          } else if (lesson.relevance === 3) {
            highIterator++;
          } else if (lesson.relevance === 4) {
            superHighIterator++;
          }
          recommendedLessons.push(lesson);
        }
      }
    } else {
      const superHighLessonsCount = superHighRelevanceLessons.length;
      const highLessonsCount = highRelevanceLessons.length;
      const mediumLessonsCount = mediumRelevanceLessons.length;
      const lowLessonsCount =
        recommendedLessonsCount -
        superHighLessonsCount -
        highLessonsCount -
        mediumLessonsCount;
      const classesPerFront = this.getClassesPerFront(
        lowRelevanceLessons,
        lowLessonsCount,
      );
      let lowIterator = 0;
      let mediumIterator = 0;
      let highIterator = 0;
      let superHighIterator = 0;
      let AFrontIterator = 0;
      let BFrontIterator = 0;
      let CFrontIterator = 0;
      let DFrontIterator = 0;

      for (let i = 0; i < allLessonsReduced.length; i++) {
        const lesson = allLessonsReduced[i];
        if (
          (lesson.relevance === 1 && lowIterator < lowLessonsCount) ||
          (lesson.relevance === 2 && mediumIterator < mediumLessonsCount) ||
          (lesson.relevance === 3 && highIterator < highLessonsCount) ||
          (lesson.relevance === 4 && superHighIterator < superHighLessonsCount)
        ) {
          if (lesson.relevance === 1) {
            if (lesson.front == 1 && AFrontIterator < classesPerFront.frontA) {
              AFrontIterator++;
              lowIterator++;
            } else if (
              lesson.front == 2 &&
              BFrontIterator < classesPerFront.frontB
            ) {
              BFrontIterator++;
              lowIterator++;
            } else if (
              lesson.front == 3 &&
              CFrontIterator < classesPerFront.frontC
            ) {
              CFrontIterator++;
              lowIterator++;
            } else if (
              lesson.front == 3 &&
              DFrontIterator < classesPerFront.frontD
            ) {
              DFrontIterator++;
              lowIterator++;
            }
          } else if (lesson.relevance === 2) {
            mediumIterator++;
          } else if (lesson.relevance === 3) {
            highIterator++;
          } else if (lesson.relevance === 4) {
            superHighIterator++;
          }
          recommendedLessons.push(lesson);
        }
      }
    }

    const recommendedLessonIds = new Set(
      recommendedLessons.map((lesson) => lesson.id),
    );

    const array1 = recommendedLessons.map((lesson) => ({
      id: lesson.id,
      class_name: lesson.class_name,
      great_topic_name: lesson.great_topic_name,
      topic_name: lesson.topic_name,
    }));

    const array2 = allLessonsReduced
      .filter((lesson) => !recommendedLessonIds.has(lesson.id))
      .map((lesson) => ({
        id: lesson.id,
        class_name: lesson.class_name,
        great_topic_name: lesson.great_topic_name,
        topic_name: lesson.topic_name,
      }));

    return { array1, array2, lessonsPerDay };
  }

  async exceededNumberOfMeps(uid) {
    const N_MAX_OF_MEPS = 4;
    try {
      const amountOfMeps = await this.usersService.getNumberOfMepsByUid(uid);
      return amountOfMeps >= N_MAX_OF_MEPS;
    } catch (error) {
      console.error('Ocorreu um erro ao checar o número de meps', error);
    }
  }

  async createMepAndSave(createMepDto: CreateMepDto) {
    if (!createMepDto.uid) {
      throw new Error('Usuario não informado ou não autenticado');
    }
    if (await this.exceededNumberOfMeps(createMepDto.uid)) {
      throw new Error(
        'O usuário atingiu a capacidade máxima de MEPs permitidos.',
      );
    }
    await this.usersService.inrementActivedMepsByUid(createMepDto.uid);

    const mepFull = await this.createMep(createMepDto);
    const { schedule, ...mepInfos } = mepFull;

    try {
      const db = firebaseAdminApp.firestore();
      const minMepCollection = await db.collection('MEP_MIN_COLLECTION');
      const fullMepCollection = await db.collection('MEP_FULL_COLLECTION');

      const fullMepReference = await fullMepCollection.add({
        uid: createMepDto.uid,
        ...mepFull,
      });

      const minMepReference = await minMepCollection.add({
        uid: createMepDto.uid,
        ...mepInfos,
        fullMepReference: fullMepReference.id,
      });

      return { mepMin: minMepReference.id, mepFull: fullMepReference.id };
    } catch (error) {
      console.error('Ocorreu um erro ao tentar gravar mep no firebase', error);
      throw error;
    }
  }

  async markLessons(
    uid: string,
    fullMepId: string,
    day: number,
    lesson: number,
  ) {
    const mepFull = await this.getAFullMepById(fullMepId);

    if (uid && uid != mepFull.uid) {
      throw new Error('Usuario não é o dono do MEP!');
    }

    mepFull.schedule[day].classes[lesson].check =
      !mepFull.schedule[day].classes[lesson].check;

    try {
      const db = firebaseAdminApp.firestore();

      await db.collection('MEP_FULL_COLLECTION').doc(fullMepId).update(mepFull);
    } catch (error) {
      console.error(
        'Ocorreu um erro ao tentar atualizar informações do mep',
        error,
      );
      throw error;
    }
  }

  async getAllMinimalMepsByUid(uid) {
    try {
      const db = firebaseAdminApp.firestore();
      const mepsMinSnapshot = await db
        .collection('MEP_MIN_COLLECTION')
        .where('uid', '==', uid)
        .get();

      const mepsDocuments = await mepsMinSnapshot.docs.map((doc) => ({
        createdAt: this.timesTempToBrazilDate(doc.createTime),
        id: doc.id,
        ...doc.data(),
      }));

      return JSON.stringify(mepsDocuments);
    } catch (error) {
      console.error('Ocorreu um erro ao tentar gravar mep no firebase', error);
      throw error;
    }
  }

  private timesTempToBrazilDate(timestamp) {
    const data = new Date(timestamp._seconds * 1000); // Multiplicado por 1000 para converter de segundos para milissegundos
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês é baseado em zero, então adicionamos 1
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }

  async getAFullMepById(fullMepId): Promise<FullMepType> {
    try {
      const db = firebaseAdminApp.firestore();
      const mepSnapshot = await db
        .collection('MEP_FULL_COLLECTION')
        .doc(fullMepId)
        .get();

      if (mepSnapshot.exists) {
        const data = mepSnapshot.data();
        return {
          id: mepSnapshot.id,
          uid: data.uid,
          startDate: data.startDate,
          endDate: data.endDate,
          weekDays: data.weekDays,
          entranceExam: data.entranceExam,
          hoursPerDay: data.hoursPerDay,
          schedule: data.schedule,
          classesPerDay: data.classesPerDay,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Ocorreu um erro ao tentar gravar mep no firebase', error);
      throw error;
    }
  }

  async getAMinimalMepById(minimalMepId) {
    try {
      const db = firebaseAdminApp.firestore();
      const mepSnapshot = await db
        .collection('MEP_MIN_COLLECTION')
        .doc(minimalMepId)
        .get();

      if (mepSnapshot.exists) {
        const data = mepSnapshot.data();
        return { id: mepSnapshot.id, ...data };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Ocorreu um erro ao tentar gravar mep no firebase', error);
      throw error;
    }
  }

  async getAFullMepLinkedToAMinimalMep(minimalMepId) {
    try {
      const db = firebaseAdminApp.firestore();
      const minimalMepSnapshot = await db
        .collection('MEP_MIN_COLLECTION')
        .doc(minimalMepId)
        .get();

      if (minimalMepSnapshot.exists) {
        const fullMepId = minimalMepSnapshot.data().fullMepReference;
        return this.getAFullMepById(fullMepId);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Ocorreu um erro ao tentar gravar mep no firebase', error);
      throw error;
    }
  }

  async createMep(createMepDto: CreateMepDto) {
    //Recuperamos as especificações do usuário para poder criar seu mep.
    const startDate = new Date(createMepDto.startDate);
    const endDate = new Date(createMepDto.endDate);
    const chosenDays = this.bitsToDays(createMepDto.weekDays);
    const classesPerDay = createMepDto.lessonsPerDay;

    //criamos a estrutura no mep apenas com as datas.
    const mepScheduleStructure = this.createMepScheduleStructure(
      startDate,
      endDate,
      chosenDays,
    );

    //recuperamos todas as aulas de acordo com a sheet do exame específico passado pelo usuário.
    const entranceExamSheetName = createMepDto.entrance_exam;
    const service = this.googleSheetsService;
    const allLessons = await service.getFormatedData(entranceExamSheetName);

    const chosenLessons = allLessons
      .filter((lesson) =>
        createMepDto.chosenLessonsReference.includes(lesson.id),
      )
      .map((lesson) => ({
        id: lesson.id,
        class_name: lesson.class_name,
        topic_name: lesson.topic_name,
      }));

    //agrupamos as aulas de acordo com a quantidade de aulas por dia
    //['aula_a', 'aula_b','aula_c','aula_d'] -> [['aula_a', 'aula_b'] ,['aula_c','aula_d']]
    const groupedClasses = chosenLessons.reduce((result, item, index) => {
      const linhaAtual = Math.floor(index / createMepDto.lessonsPerDay);
      if (!result[linhaAtual]) {
        result[linhaAtual] = [];
      }
      result[linhaAtual].push(item);
      return result;
    }, []);

    //redefinimos o tamanho do array de aulas agrupadas e da estrutura do mep para que
    //sejam compatíveis.
    groupedClasses.splice(mepScheduleStructure.length);
    mepScheduleStructure.splice(Math.ceil(groupedClasses.length));

    //adicionamos as aulas ao mep.
    mepScheduleStructure.forEach((element, index) => {
      const classesOfTheDay = groupedClasses[index];
      for (let i = 0; i < classesOfTheDay.length; i++) {
        element.classes.push({
          id: classesOfTheDay[i].id,
          name: classesOfTheDay[i].class_name,
          check: false,
        });
      }
    });

    return {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      entranceExam: createMepDto.entrance_exam,
      weekDays: createMepDto.weekDays,
      hoursPerDay: createMepDto.hoursPerDay,
      schedule: mepScheduleStructure,
      classesPerDay,
    };
  }

  private createMepScheduleStructure(
    startDate: Date,
    endDate: Date,
    chosenDays: number[],
  ): any[] {
    const weekDictionary = {
      0: 'Domingo',
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
      6: 'Sábado',
    };
    const schedule: any[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthDay = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const weekDay = currentDate.getDay();

      if (chosenDays.includes(weekDay))
        schedule.push({
          date: `${monthDay}/${month} - ${weekDictionary[weekDay]}`,
          classes: [],
          notes: [],
        });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedule;
  }

  private createMepClassesDetails(
    weeksCount: number,
    daysPerWeek: number,
    hoursPerDay: number,
  ): MepClassesDetails {
    const mepLogicPath = process.env.MEP_LOGIC;
    const mepLogicData = readFileSync(mepLogicPath, 'utf-8');
    const mepLogic: MepLogicScenario[] = JSON.parse(mepLogicData);

    // Encontre o cenário apropriado com base no intervalo de semanas
    const relevantScenario = mepLogic.find((scenario) => {
      const [minWeeks, maxWeeks] = scenario.weeksRange;
      return weeksCount > minWeeks && weeksCount <= maxWeeks;
    });

    if (!relevantScenario) {
      throw new Error('Prazo de semanas inválido');
    }

    // Encontre a condição apropriada com base nos dias por semana
    const relevantCondition = relevantScenario.conditions.find((condition) =>
      condition.daysPerWeek.includes(daysPerWeek),
    );

    if (!relevantCondition) {
      throw new Error('Número inválido de dias por semana');
    }

    // Encontre a subcondição apropriada com base nas horas por dia
    const relevantSubcondition = relevantCondition.subconditions.find(
      (subcondition) => subcondition.hoursPerDay.includes(hoursPerDay),
    );

    if (!relevantSubcondition) {
      throw new Error('Combinação inválida de horas por dia');
    }

    return {
      lessonsPerDay: relevantSubcondition.classesPerDay,
    };
  }

  private bitsToDays(bits: number) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if ((bits >> i) & 1) {
        week.push(i);
      }
    }
    return week;
  }

  private countWeeksBetweenDates(startDate: Date, endDate: Date): number {
    const weeks = differenceInWeeks(endDate, startDate);
    return weeks;
  }

  private getClassesPerFront(anyRelevanceLessons, anyLessonsCount) {
    const frontALessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 1,
    );
    const frontBLessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 2,
    );
    const frontCLessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 3,
    );
    const frontDLessons = anyRelevanceLessons.filter(
      (lesson) => lesson.front == 4,
    );

    const proportionFrontALessons =
      frontALessons.length / anyRelevanceLessons.length;
    const proportionFrontBLessons =
      frontBLessons.length / anyRelevanceLessons.length;
    const proportionFrontCLessons =
      frontCLessons.length / anyRelevanceLessons.length;
    const proportionFrontDLessons =
      frontDLessons.length / anyRelevanceLessons.length;

    // Divide o número de aulas de relevância média em três partes proporcionais
    const classesPerFront = {
      frontA: Math.round(anyLessonsCount * proportionFrontALessons),
      frontB: Math.round(anyLessonsCount * proportionFrontBLessons),
      frontC: Math.round(anyLessonsCount * proportionFrontCLessons),
      frontD: Math.round(anyLessonsCount * proportionFrontDLessons),
    };

    const totalAdjusted =
      classesPerFront.frontA +
      classesPerFront.frontB +
      classesPerFront.frontC +
      classesPerFront.frontD;
    const adjustment = anyLessonsCount - totalAdjusted;
    if (adjustment !== 0) {
      // Adiciona o ajuste ao maior valor proporcional
      if (adjustment > 0) {
        const frontsArray = ['frontA', 'frontB', 'frontC', 'frontD'];
        const largestFront = frontsArray.reduce((prev, curr) => {
          return classesPerFront[prev] > classesPerFront[curr] ? prev : curr;
        });
        classesPerFront[largestFront] += adjustment;
      } else {
        // Subtrai o ajuste do menor valor proporcional
        const frontsArray = ['frontA', 'frontB', 'frontC', 'frontD'];
        const smallestFront = frontsArray.reduce((prev, curr) => {
          return classesPerFront[prev] < classesPerFront[curr] ? prev : curr;
        });
        classesPerFront[smallestFront] += adjustment;
      }
    }

    return classesPerFront;
  }
  async deleteMepById(req) {
    try {
      const minMepSnapshot = await firebaseAdminApp
        .firestore()
        .collection('MEP_MIN_COLLECTION')
        .doc(req.mepId)
        .get();
      if (!minMepSnapshot.exists) {
        throw Error('referencia minMep não existe');
      }
      const minMep = minMepSnapshot.data();
      const minMepRef = minMepSnapshot.id;

      await this.usersService.decrementActivedMepsByUid(req.uid);
      console.log(minMep);
      if (minMep.uid !== req.uid) {
        throw Error(
          'Erro ao tentar excluir um mep que não existe ou não é do usuário',
        );
      }

      await firebaseAdminApp
        .firestore()
        .collection('MEP_MIN_COLLECTION')
        .doc(minMepRef)
        .delete();

      await firebaseAdminApp
        .firestore()
        .collection('MEP_FULL_COLLECTION')
        .doc(minMep.fullMepReference)
        .delete();
      console.log('Mep apagado com sucesso');
    } catch (error) {
      console.error('Erro ao tentar apagar um mep', error);
    }
  }
}
