import { TestBed } from '@angular/core/testing';

import { MepCreationService } from './mep-creation.service';

describe('MepCreationService', () => {
  let service: MepCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MepCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
