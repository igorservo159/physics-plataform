import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceDownloadComponent } from './workspace-download.component';

describe('WorkspaceDownloadComponent', () => {
  let component: WorkspaceDownloadComponent;
  let fixture: ComponentFixture<WorkspaceDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceDownloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
