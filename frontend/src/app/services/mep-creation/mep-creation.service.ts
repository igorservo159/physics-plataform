import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MepCreationService {
  startDate!: string;
  endDate!: string;
  vestibular!: string;
  header!: any;
  daysWeek!: number;
  hours!: number;
  lessonsPerDay!: number;
  lessonsIds!: number[];
  userId!: string | undefined;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.vestibular = 'ENEM';

    this.authService.userId$.subscribe((res) => {
      this.userId = res;
    });
  }

  postData(): Observable<any> {
    const datas = {
      startDate: this.startDate,
      endDate: this.endDate,
      weekDays: this.daysWeek,
      hoursPerDay: this.hours,
      entrance_exam: this.vestibular,
    };
    return this.http.post<any>(
      environment.apiUrl + 'mep/getRecommendedLessons',
      datas
    );
  }

  async createMep(): Promise<Observable<any>> {
    var tk = this.authService.getCurrentToken();

    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    this.header = new HttpHeaders({ Authorization: `Bearer ${tk}` });
    const datas = {
      startDate: this.startDate,
      endDate: this.endDate,
      weekDays: this.daysWeek,
      hoursPerDay: this.hours,
      entrance_exam: this.vestibular,
      lessonsPerDay: this.lessonsPerDay,
      chosenLessonsReference: this.lessonsIds,
    };
    console.log(datas);
    return this.http.post<any>(
      environment.apiUrl + 'mep/createAndSave',
      datas,
      { headers: this.header }
    );
  }

  async getUserMepsMinimal(): Promise<Observable<any>> {
    var tk = this.authService.getCurrentToken();

    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    this.header = new HttpHeaders({ Authorization: `Bearer ${tk}` });

    return this.http.get<any>(environment.apiUrl + 'mep/minimal', {
      headers: this.header,
    });
  }

  async downloadMep(mepId: string) {
    var tk = this.authService.getCurrentToken();

    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    const options = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/pdf',
        Authorization: `Bearer ${tk}`,
      }),
    };

    this.http
      .get(environment.apiUrl + 'mep/generatePdf/' + mepId, options)
      .subscribe(
        (response: any) => {
          const blob = new Blob([response], { type: 'application/pdf' });

          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.download = 'arquivo.pdf';

          document.body.appendChild(downloadLink);
          downloadLink.click();

          document.body.removeChild(downloadLink);
        },
        (error) => {
          console.error('Erro ao baixar o arquivo PDF', error);
        }
      );
  }

  async getFullMep(id: string): Promise<Observable<any>> {
    var tk = this.authService.getCurrentToken();

    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    let header = new HttpHeaders({ Authorization: `Bearer ${tk}` });

    return this.http.get(environment.apiUrl + 'mep/full/' + id, {
      headers: header,
    });
  }

  async checkStudy(
    studyIndex: number,
    mepId: string,
    dayIndex: number
  ): Promise<Observable<any>> {
    var tk = this.authService.getCurrentToken();
    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    let header = new HttpHeaders({ Authorization: `Bearer ${tk}` });

    let data = {
      fullMepId: mepId,
      day: dayIndex,
      lesson: studyIndex,
    };

    return this.http.post<any>(environment.apiUrl + 'mep/markLessons', data, {
      headers: header,
    });
  }

  async deleteMep(mepId: string): Promise<Observable<any>> {
    var tk = this.authService.getCurrentToken();
    if (tk == null) {
      await this.authService.reloadToken()?.then((res) => {
        tk = res;
        this.authService.setCurrentToken(tk);
      });
    }

    let header = new HttpHeaders({ Authorization: `Bearer ${tk}` });

    console.log(tk);

    console.log(environment.apiUrl + 'mep/' + mepId);

    return this.http.delete<any>(environment.apiUrl + 'mep/' + mepId, {
      headers: header,
    });
  }
}
