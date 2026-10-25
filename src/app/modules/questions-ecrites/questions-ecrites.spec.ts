import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsEcrites } from './questions-ecrites';

describe('QuestionsEcrites', () => {
  let component: QuestionsEcrites;
  let fixture: ComponentFixture<QuestionsEcrites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionsEcrites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionsEcrites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
