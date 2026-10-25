import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QuestionsEcritesService } from 'src/app/core/questions-ecrites/questions-ecrites.service';
import { EntrainementConfig, PermisType, QuestionCorrection, QuestionResult, Questions } from 'src/app/core/questions-ecrites/questions-ecrites.types';

@Component({
  selector: 'app-entrainement',
  imports: [
    RouterLink
  ],
  templateUrl: './entrainement.html',
  styleUrl: './entrainement.scss',
})
export class Entrainement implements OnInit {
   private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _questionsService = inject(QuestionsEcritesService);

  // -----------------------------------------------------
  // Configuration
  // -----------------------------------------------------

  readonly permis = signal<PermisType>('C');
  readonly fiche = signal<number | null>(null);
  readonly isRandom = signal(false);

  // -----------------------------------------------------
  // État de l'entraînement
  // -----------------------------------------------------

  readonly questions = signal<QuestionCorrection[]>([]);

  readonly currentIndex = signal(0);
  readonly answer = signal('');
  readonly validated = signal(false);

  readonly results = signal<QuestionResult[]>([]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // -----------------------------------------------------
  // Computed
  // -----------------------------------------------------

  readonly total = computed(() => this.questions().length);

  readonly question = computed(
    () =>
      this.questions()[this.currentIndex()] ??
      ({} as QuestionCorrection),
  );

  readonly correction = computed(() => {
    const question = this.question();
  
    if (!question?.reponse) {
      return null;
    }

    return {
      reponse: question.reponse,
      explication: question.explication ?? '',
    };
  });

  readonly currentResult = computed(() =>
    this.results().find(
      result => result.questionId === this.question()?._id,
    ) ?? null,
  );

  readonly score = computed(
    () => this.results().filter(result => result.reussie).length,
  );

  readonly progress = computed(() => {
    if (!this.total()) return 0;

    return Math.round(
      (this.results().length / this.total()) * 100,
    );
  });

  readonly finished = computed(
    () =>
      this.total() > 0 &&
      this.currentIndex() >= this.total(),
  );

  readonly failedQuestions = computed(() =>
    this.results()
      .filter(result => !result.reussie)
      .map(result => {
        const question = this.questions().find(
          q => q._id === result.questionId,
        );

        return {
          result,
          question,
          correction: question
            ? {
                reponse: question.reponse,
                explication: question.explication,
              }
            : null,
        };
      }),
  );

  // -----------------------------------------------------
  // Initialisation
  // -----------------------------------------------------

  ngOnInit(): void {
    const params = this._route.snapshot.queryParamMap;

    console.log('question',this.question);
    

    const permis: PermisType =
      params.get('permis') === 'CE' ? 'CE' : 'C';

    const mode = params.get('mode');
    const fiche = Number(params.get('fiche'));

    this.permis.set(permis);
    this.isRandom.set(mode === 'aleatoire');

    if (mode !== 'aleatoire') {
      if (
        !Number.isInteger(fiche) ||
        fiche < 1 ||
        fiche > 20
      ) {
        this.error.set('Numéro de fiche invalide.');
        return;
      }

      this.fiche.set(fiche);
    }

    this.start();
  }

  // -----------------------------------------------------
  // Démarrer l'entraînement
  // -----------------------------------------------------

  async start(): Promise<void> {
    if (this.loading()) return;

    this.reset();
    this.loading.set(true);

    try {
      let questions: Questions;

      if (this.isRandom()) {
        questions = await this.loadRandomQuestions();
      } else {
        const ficheId = this.fiche();

        if (ficheId === null) {
          throw new Error('Aucune fiche sélectionnée.');
        }

        questions = await firstValueFrom(
          this._questionsService.getQuestionByFicheId(ficheId),
        );
      }

      if (this._destroyRef.destroyed) return;

      if (questions.length !== 10) {
        throw new Error(
          'La série doit contenir exactement 10 questions.',
        );
      }

      // Vérifier que les corrections sont disponibles
      if (
        questions.some(
          q => typeof q.reponse !== 'string' || !q.reponse.trim(),
        )
      ) {
        throw new Error(
          'Les réponses attendues ne sont pas fournies par l’API. ' +
          'Il faut ajouter une route de validation dans NestJS.',
        );
      }

      this.questions.set(questions);

    } catch (error) {
      if (this._destroyRef.destroyed) return;

      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les questions.',
      );

    } finally {
      if (!this._destroyRef.destroyed) {
        this.loading.set(false);
      }
    }
  }

  // -----------------------------------------------------
  // 10 questions aléatoires
  // -----------------------------------------------------

  private async loadRandomQuestions(): Promise<Questions> {
  return await firstValueFrom(
    this._questionsService.getRandom()
  );
}

  // -----------------------------------------------------
  // Saisie utilisateur
  // -----------------------------------------------------

  setAnswer(value: string): void {
  if (this.validated()) return;

  this.answer.set(value);
}

  // -----------------------------------------------------
  // Normalisation de la réponse
  // -----------------------------------------------------

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // -----------------------------------------------------
  // Validation
  // -----------------------------------------------------

  validate(): void {
    if (this.validated()) return;

    const question = this.question();
    const correction = this.correction();
    const saisie = this.answer().trim();

    if (!question?._id || !correction || !saisie) {
      return;
    }

    const reussie =
      this.normalize(saisie) ===
      this.normalize(correction.reponse);

    this.results.update(results => [
      ...results,
      {
        questionId: question._id,
        saisie,
        reussie,
      },
    ]);

    this.validated.set(true);
  }

  

  // -----------------------------------------------------
  // Correction manuelle
  // -----------------------------------------------------

  markAnswer(reussie: boolean): void {
    if (!this.validated()) return;

    const questionId = this.question()?._id;

    this.results.update(results =>
      results.map(result =>
        result.questionId === questionId
          ? { ...result, reussie }
          : result,
      ),
    );
  }

  // -----------------------------------------------------
  // Question suivante
  // -----------------------------------------------------

  next(): void {
    if (!this.validated()) return;

    this.currentIndex.update(index => index + 1);

    this.answer.set('');
    this.validated.set(false);
  }

  // -----------------------------------------------------
  // Recommencer
  // -----------------------------------------------------

  restart(): void {
    this.currentIndex.set(0);
    this.answer.set('');
    this.validated.set(false);
    this.results.set([]);
  }

  // -----------------------------------------------------
  // Réinitialiser
  // -----------------------------------------------------

  private reset(): void {
    this.questions.set([]);
    this.currentIndex.set(0);
    this.answer.set('');
    this.validated.set(false);
    this.results.set([]);
    this.error.set(null);
  }
}
