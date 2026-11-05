import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesOrales } from './fiches-orales';

describe('FichesOrales', () => {
  let component: FichesOrales;
  let fixture: ComponentFixture<FichesOrales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesOrales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichesOrales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
