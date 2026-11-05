import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesOraleEntrainement } from './fiches-orale-entrainement';

describe('FichesOraleEntrainement', () => {
  let component: FichesOraleEntrainement;
  let fixture: ComponentFixture<FichesOraleEntrainement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesOraleEntrainement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichesOraleEntrainement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
