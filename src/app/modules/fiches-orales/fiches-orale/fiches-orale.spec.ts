import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesOrale } from './fiches-orale';

describe('FichesOrale', () => {
  let component: FichesOrale;
  let fixture: ComponentFixture<FichesOrale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesOrale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichesOrale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
