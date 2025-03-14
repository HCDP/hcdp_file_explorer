import { TestBed } from '@angular/core/testing';

import { PathFactoryService } from './path-factory.service';

describe('PathFactoryService', () => {
  let service: PathFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PathFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
