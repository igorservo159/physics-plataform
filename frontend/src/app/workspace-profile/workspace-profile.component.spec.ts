import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceProfileComponent } from './workspace-profile.component';

describe('WorkspaceProfileComponent', () => {
  let component: WorkspaceProfileComponent;
  let fixture: ComponentFixture<WorkspaceProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
