import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule, MatStepper, StepperOrientation } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter, ThemePalette } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MepCreationService } from '../services/mep-creation/mep-creation.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth/auth.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MepViewComponent } from './components/mep-view/mep-view.component';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

export class Lesson {
  id!: number;
  class_name!: string;
  great_topic_name!: string;
  topic_name!: string;
  completed!: boolean;
  color: ThemePalette;

  constructor(
    _id: number,
    _class_name: string,
    _great_topic_name: string,
    _topic_name: string
  ) {
    this.id = _id;
    this.class_name = _class_name;
    this.great_topic_name = _great_topic_name;
    this.topic_name = _topic_name;
    this.color = 'primary';
    this.completed = false;
  }
}

interface TopicNode {
  name: string;
  children?: TopicNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-workspace-mep',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSliderModule,
    MatCheckboxModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MepViewComponent,

  ],
  providers: [provideNativeDateAdapter(), MepCreationService],
  templateUrl: './workspace-mep.component.html',
  styleUrl: './workspace-mep.component.css',
})
export class WorkspaceMepComponent implements OnInit {
  started: boolean = false;
  currentMep: any;
  startMep() {
    this.makingMepSubject.next(true);
    this.started = true;
  }

  selectedStep!: number;
  completed!: boolean;
  contentLoaded: boolean = false;

  daysNumber!: number;
  daysWeek!: number;
  minNumberHours!: number;
  maxNumberHours!: number;
  hours!: number;
  datas!: any;
  lessonsArr1!: Lesson[];
  great_topics!: any;
  topics!: any;
  classes!: any;
  lessonsPerDay!: number;
  lessonsIds!: number[];
  mep!: any;

  private mepsMinimalIds = new BehaviorSubject<object>({});
  mepsMinimalIds$ = this.mepsMinimalIds.asObservable();

  hasMep: boolean = false;
  makingMep: boolean = false;

  makingMepSubject = new BehaviorSubject<boolean>(false);

  stepperOrientation: Observable<StepperOrientation>;

  constructor(
    private formBuilder: FormBuilder,
    private mepCreation: MepCreationService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 576px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  dates!: FormGroup;
  hoursWeek!: FormGroup;
  lessonsSelection!: FormGroup;

  TREE_DATA!: TopicNode[];

  private _transformer = (node: TopicNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit(): void {
    this.completed = false;
    this.selectedStep = 0;
    this.daysNumber = 0;
    this.daysWeek = 0;
    this.minNumberHours = 1.5;
    this.maxNumberHours = 4;
    this.hours = 0;
    this.lessonsArr1 = [];

    this.TREE_DATA = [];

    this.dates = this.formBuilder.group(
      {
        startDate: new FormControl(new Date(''), [Validators.required]),
        endDate: new FormControl(new Date(''), [Validators.required]),
      },
      { validators: this.validateDateRange() }
    );

    this.hoursWeek = this.formBuilder.group(
      {
        segunda: new FormControl(false, [Validators.required]),
        terca: new FormControl(false, [Validators.required]),
        quarta: new FormControl(false, [Validators.required]),
        quinta: new FormControl(false, [Validators.required]),
        sexta: new FormControl(false, [Validators.required]),
        sabado: new FormControl(false, [Validators.required]),
        domingo: new FormControl(false, [Validators.required]),

        hours: new FormControl(this.maxNumberHours, [Validators.required]),
      },
      { validators: this.validateWeek() }
    );

    this.lessonsSelection = this.formBuilder.group({});

    const weekdays = [
      'segunda',
      'terca',
      'quarta',
      'quinta',
      'sexta',
      'sabado',
      'domingo',
    ];
    weekdays.forEach((day) => {
      this.hoursWeek.get(day)?.valueChanges.subscribe(() => {
        this.daysWeekValue();
        this.rangeHours();
        this.cdr.detectChanges();
      });
    });

    this.hoursWeek.get('hours')?.valueChanges.subscribe(() => {
      this.hours = this.hoursWeek.get('hours')?.value;
    });

    this.auth.userLogginSource$.subscribe((res) => {
      if (res) {
        this.mepCreation.getUserMepsMinimal().then((next) => {
          next.subscribe({
            next: (res) => {
              this.mepsMinimalIds.next(res);
              if (res.length != 0) {
                this.hasMep = true;
              } else {
                this.hasMep = false;
              }
            },
            error: (err) => {
              console.log(err);
            },
            complete: () => {
              this.contentLoaded = true;
            },
          });
        });
      } else {
        this.contentLoaded = false;
      }
    });

    this.makingMepSubject.subscribe((res) => {
      this.makingMep = res;
      if (this.makingMep) {
        this.started = true;
      }
    });
  }

  backToMeps() {
    window.location.reload();
  }

  showMeps() {
    this.makingMepSubject.next(false);
    this.started = false;
    this.contentLoaded = false;

    this.mepCreation.getUserMepsMinimal().then((next) => {
      next.subscribe({
        next: (res) => {
          this.mepsMinimalIds.next(res);
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          this.contentLoaded = true;
        },
      });
    });
  }

  validateDateRange(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        return { invalidDateType: true };
      }
      if (startDate.getTime() < currentDate.getTime()) {
        return { startDateError: true };
      }
      if (endDate.getTime() <= startDate.getTime()) {
        return { rangeDaysError: true };
      }
      if (this.rangeDates(startDate, endDate) < 16) {
        return { rangeMonthUnder: true };
      }
      if (this.rangeDates(startDate, endDate) > 30) {
        return { rangeMonthOver: true };
      }
      return null;
    };
  }

  validateWeek(): ValidatorFn {
    return (): ValidationErrors | null => {
      if (this.daysWeek == 0) {
        return { selectionError: true };
      }
      return null;
    };
  }

  rangeDates(startDate: Date, endDate: Date) {
    const rangeDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return rangeDays / 7;
  }

  rangeHours() {
    if (this.daysNumber > 1 && this.daysWeek > 0) {
      this.hoursWeek.get('hours')?.enable();
      this.minNumberHours = 1.5;
      this.maxNumberHours = 4;
    } else {
      this.hoursWeek.get('hours')?.disable();
      this.minNumberHours = 1.5;
      this.maxNumberHours = 4;
      this.hoursWeek.get('hours')?.setValue(this.maxNumberHours);
    }
  }

  saveOnSession() {
    this.completed = false;
    this.mepCreation.startDate = `${this.startDate.getFullYear()}-${(
      this.startDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${this.startDate
        .getDate()
        .toString()
        .padStart(2, '0')} 00:00:00`;
    this.mepCreation.endDate = `${this.endDate.getFullYear()}-${(
      this.endDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${this.endDate
        .getDate()
        .toString()
        .padStart(2, '0')} 00:00:00`;
    this.mepCreation.daysWeek = this.daysWeek;
    this.mepCreation.hours = this.hours;

    this.mepCreation.postData().subscribe((response) => {
      this.datas = response;
      console.log(this.datas);
      this.great_topics = new Set();
      this.topics = new Map();
      this.classes = [];
      let classes_group: any = [];
      let i = this.datas.array1[0].class_name.split('.')[0];

      this.datas.array1.forEach((lesson: any) => {
        const { id, class_name, great_topic_name, topic_name } = lesson;
        const newLesson = new Lesson(
          id,
          class_name,
          great_topic_name,
          topic_name
        );

        this.lessonsArr1.push(newLesson);

        if (!this.great_topics.has(newLesson.great_topic_name)) {
          this.great_topics.add(newLesson.great_topic_name);
        }

        if (!this.topics.has(newLesson.great_topic_name)) {
          this.topics.set(newLesson.great_topic_name, new Set());
        }

        this.topics.get(newLesson.great_topic_name).add(newLesson.topic_name);
        if (newLesson.class_name.split('.')[0] != i) {
          i = newLesson.class_name.split('.')[0];
          this.classes.push(classes_group);
          classes_group = [];
          classes_group.push(newLesson.class_name);
        } else {
          classes_group.push(newLesson.class_name);
        }
      });

      let k = 0;
      this.classes.forEach((subClasses: any) => {
        this.classes[k] = subClasses.map((class_name: any) => ({
          name: class_name,
        }));
        k++;
      });
      this.great_topics = Array.from(this.great_topics);

      this.TREE_DATA = [];
      let j = 0;
      this.great_topics.forEach((great_topic: string) => {
        const uniqueTopics = Array.from(this.topics.get(great_topic)).map(
          (topic: any) => ({ name: topic, children: this.classes[j++] })
        );
        this.TREE_DATA.push({
          name: great_topic,
          children: uniqueTopics,
        });
      });

      this.dataSource.data = this.TREE_DATA;
      console.log('datas ' + this.datas);
      this.lessonsPerDay = this.datas.lessonsPerDay;
      this.lessonsIds = [];
      this.lessonsArr1.forEach((lesson) => this.lessonsIds.push(lesson.id));

      this.getCreatedMep();
      this.completed = true;
    });
  }

  get startDate() {
    return this.dates.get('startDate')?.value;
  }

  get endDate() {
    return this.dates.get('endDate')?.value;
  }

  daysWeekValue() {
    this.daysWeek = 0;
    this.daysNumber = 0;
    const days = [
      'segunda',
      'terca',
      'quarta',
      'quinta',
      'sexta',
      'sabado',
      'domingo',
    ];
    days.forEach((day) => {
      if (this.hoursWeek.get(day)?.value) {
        switch (day) {
          case 'segunda':
            this.daysWeek += 2;
            this.daysNumber += 1;
            break;
          case 'terca':
            this.daysWeek += 4;
            this.daysNumber += 1;
            break;
          case 'quarta':
            this.daysWeek += 8;
            this.daysNumber += 1;
            break;
          case 'quinta':
            this.daysWeek += 16;
            this.daysNumber += 1;
            break;
          case 'sexta':
            this.daysWeek += 32;
            this.daysNumber += 1;
            break;
          case 'sabado':
            this.daysWeek += 64;
            this.daysNumber += 1;
            break;
          case 'domingo':
            this.daysWeek += 1;
            this.daysNumber += 1;
            break;
        }
      }
    });
    return this.daysWeek;
  }

  resetStepper(stepper: MatStepper) {
    stepper.reset();
    this.ngOnInit();
  }

  formatLabel(value: number): string {
    return value + 'h';
  }

  getCompleted(node: any): boolean {
    return this.lessonsArr1
      .filter((item) => item.class_name === node.name)
      .every((item) => item.completed);
  }

  getColor(node: any) {
    let color;
    this.lessonsArr1.forEach((item) => {
      if (item.class_name === node.name) {
        color = item.color;
      }
    });
    return color;
  }

  complete(node: any) {
    return this.lessonsArr1
      .filter((item) => item.class_name === node.name)
      .every((item) => (item.completed = !item.completed));
  }

  checkStep(event: any) {
    console.log(event);
    this.selectedStep = event.selectedIndex;
    if (this.selectedStep == 2) {
      this.saveOnSession();
    }
  }

  getCreatedMep() {
    this.mepCreation.lessonsPerDay = this.lessonsPerDay;
    this.mepCreation.lessonsIds = this.lessonsIds;
    this.mepCreation.createMep().then((next) => {
      next.subscribe((response) => {
        this.mep = response;
        this.currentMep = response.mepFull;
        this.hasMep = true;
      });
    });
  }

  goToDownloadMepPage() {
    this.router.navigate(['/workspace/download']);
  }
}
