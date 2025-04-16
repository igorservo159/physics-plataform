import { Injectable } from '@nestjs/common';
import { UpdateCheckClassDto } from './dto/update-check-class.dto';
import firebaseAdminApp from 'firebase.initialization';
@Injectable()
export class HelloService {
  async update(updateCheckClassDto: UpdateCheckClassDto) {
    const snapshot = await firebaseAdminApp
      .firestore()
      .collection('MEP_FULL_COLLECTION')
      .doc(updateCheckClassDto.mepId)
      .get();

    const lesson = snapshot.data();
    return lesson;
  }
}
