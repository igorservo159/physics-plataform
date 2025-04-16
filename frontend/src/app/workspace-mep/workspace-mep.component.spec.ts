import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceMepComponent } from './workspace-mep.component';

describe('WorkspaceMepComponent', () => {
  let component: WorkspaceMepComponent;
  let fixture: ComponentFixture<WorkspaceMepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceMepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceMepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
