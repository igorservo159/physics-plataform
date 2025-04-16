import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MepViewComponent } from './mep-view.component';

describe('MepViewComponent', () => {
  let component: MepViewComponent;
  let fixture: ComponentFixture<MepViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MepViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MepViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
