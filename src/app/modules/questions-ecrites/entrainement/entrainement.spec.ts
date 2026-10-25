import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entrainement } from './entrainement';

describe('Entrainement', () => {
  let component: Entrainement;
  let fixture: ComponentFixture<Entrainement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entrainement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Entrainement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
