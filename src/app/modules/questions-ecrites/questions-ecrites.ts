import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QuestionsEcritesService } from 'src/app/core/questions-ecrites/questions-ecrites.service';
import { PermisType } from 'src/app/core/questions-ecrites/questions-ecrites.types';

@Component({
  selector: 'app-questions-ecrites',
  imports: [
    RouterLink,
  ],
  templateUrl: './questions-ecrites.html',
  styleUrl: './questions-ecrites.scss',
})
export class QuestionsEcrites {
  private _router = inject(Router);

  private _questionsService = inject(QuestionsEcritesService);

  readonly fiches = Array.from(
    { length: 20 },
    (_, index) => index + 1,
  );

  get permis() {
    return this._questionsService.permis;
  }

  changePermis(permis: PermisType): void {
    this._questionsService.setPermis(permis);
  }

  /**
   * Une fiche choisie par l'utilisateur.
   */
  choisirFiche(fiche: number): void {
    this._router.navigate(
      ['/questions-ecrites/entrainement'],
      {
        queryParams: {
          permis: this.permis(),
          mode: 'fiche',
          fiche,
        },
      },
    );
  }

  /**
   * Une fiche complète au hasard.
   */
  ficheAleatoire(): void {
    const fiche = this._questionsService.getRandomFiche();

    this.choisirFiche(fiche);
  }

  /**
   * 10 questions tirées au hasard.
   */
  questionsAleatoires(): void {
    this._router.navigate(
      ['/questions-ecrites/entrainement'],
      {
        queryParams: {
          permis: this.permis(),
          mode: 'aleatoire',
        },
      },
    );
  }
}
