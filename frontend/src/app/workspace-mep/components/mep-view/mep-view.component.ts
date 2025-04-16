import { ɵBrowserAnimationBuilder } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MepCreationService } from '../../../services/mep-creation/mep-creation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-mep-view',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './mep-view.component.html',
  styleUrl: './mep-view.component.css',
})
export class MepViewComponent implements OnInit {
  loadingViewContent: boolean = true;

  loadingMepSelectedContent: boolean = true;

  days!: any[];

  private fullMep: any;

  initialTabIndex: number | null = null;

  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup | undefined;

  @Input() mepsMinimalIdObserver: any;
  mepsMinimalId!: any[];
  selectedMEP: any;

  @Input() createMepSubject: any;

  constructor(
    private mepService: MepCreationService,
    private closeDialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.mepsMinimalIdObserver.subscribe((res: any) => {
      this.mepsMinimalId = res;
      this.selectedMEP = this.mepsMinimalId[0];
      this.loadingViewContent = false;

      this.reloadMep(this.selectedMEP['fullMepReference']);
    });
  }

  openDialog(id: string) {
    const dialogRef = this.closeDialog.open(DialogDeleteMep);

    console.log(id);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
        this.mepService.deleteMep(id).then((res) =>
          res.subscribe({
            next: () => window.location.reload(),
            error: () => window.location.reload(),
          })
        );
    });
  }

  reloadMep(id: any) {
    this.loadingMepSelectedContent = true;
    this.mepService
      .getFullMep(id)
      .then((next) => {
        next.subscribe({
          next: (res) => {
            this.fullMep = res;
            this.buildSlides();
          },
          error: () => {
            window.location.reload();
          },
        });
      })
      .catch((err) => {
        window.location.reload();
      });
  }

  buildSlides() {
    var mepSchedule = this.fullMep['schedule'];
    this.days = [];
    var currentDay = new Date();
    var initialTab = 0;

    currentDay.setDate(currentDay.getDate());

    mepSchedule.forEach((value: any, index: number) => {
      let dayList = value.date.split(' - ');
      let day = {
        day: dayList[0],
        weekday: dayList[1],
        classes: value['classes'],
      };
      this.days.push(day);

      let dateAux = dayList[0] + '/2024';
      const parts = dateAux.split('/');
      const day_ = parseInt(parts[0], 10);
      const month_ = parseInt(parts[1], 10) - 1;
      const year_ = parseInt(parts[2], 10);

      let tabDate = new Date(year_, month_, day_);

      if (tabDate <= currentDay) {
        initialTab = index;
      }
    });
    this.initialTabIndex = initialTab;
    this.loadingMepSelectedContent = false;
  }

  onStudyCheck(classIndex: number) {
    this.mepService
      .checkStudy(
        classIndex,
        this.selectedMEP['fullMepReference'],
        Number(this.initialTabIndex)
      )
      .then((next) => {
        next.subscribe({
          next: () => {},
          error: () => {
            window.location.reload();
          },
        });
      });
  }
  newMep() {
    this.createMepSubject.next(true);
  }
}

@Component({
  selector: 'dialog-delete-mep',
  templateUrl: 'dialog-delete-mep.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class DialogDeleteMep {}
