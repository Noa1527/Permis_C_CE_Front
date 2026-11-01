
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { Permis } from 'src/app/core/permis/permis.types';
import { ProgressionService } from 'src/app/core/progression/progression.service';
import { ProgressionType } from 'src/app/core/progression/progression.types';

interface ProgressionCarte {
  type: ProgressionType;
  titre: string;
  total: number | null;
  travaillees: number;
  reussies: number;
  tentatives: number;
  pourcentage: number | null;
}

// Configuration des activités
const ACTIVITES: {
  type: ProgressionType;
  titre: string;
  total: number | null;
  uniquementCE?: boolean;
}[] = [
  {
    type: ProgressionType.WRITING_QUESTION,
    titre: 'Questions écrites',
    total: 200,
  },
  {
    type: ProgressionType.ORAL_SHEET,
    titre: 'Fiches orales',
    total: 12,
  },
  {
    type: ProgressionType.THEME,
    titre: 'Thèmes',
    total: 6,
  },
  {
    type: ProgressionType.VERIFICATION,
    titre: 'Vérifications',
    total: null,
  },
  {
    type: ProgressionType.MANIABILITE,
    titre: 'Maniabilité',
    total: null,
  },
  {
    type: ProgressionType.ATTELAGE_DETELAGE,
    titre: 'Attelage / Dételage',
    total: null,
    uniquementCE: true,
  },
  {
    type: ProgressionType.PLATEAU,
    titre: 'Plateau',
    total: null,
  },
  {
    type: ProgressionType.EXAMEN_BLANC,
    titre: 'Examens blancs',
    total: null,
  },
  {
    type: ProgressionType.CODE_ROUTE,
    titre: 'Code de la route',
    total: null,
  },
];

@Component({
  selector: 'app-progression',
  standalone: true,
  templateUrl: './progression.html',
})
export class Progression implements OnInit {

  private readonly _progressionService =
    inject(ProgressionService);

  private readonly _destroyRef =
    inject(DestroyRef);

  // -----------------------------------------------------
  // Signals
  // -----------------------------------------------------

  readonly statistiques =
    this._progressionService.statistiques;

  readonly permis = signal<Permis>('C');

  readonly chargement = signal(false);
  readonly erreur = signal<string | null>(null);

  // -----------------------------------------------------
  // Statistiques du permis sélectionné
  // -----------------------------------------------------

  readonly cartes = computed<ProgressionCarte[]>(() => {

    const permis = this.permis();
    const statistiques = this.statistiques();

    return ACTIVITES
      .filter(
        activite => !activite.uniquementCE || permis === 'CE',
      )
      .map(activite => {

        const statistique = statistiques.find(
          item =>
            item._id.permis === permis &&
            item._id.type === activite.type,
        );

        const travaillees = statistique?.travaillees ?? 0;
        const reussies = statistique?.reussies ?? 0;
        const tentatives = statistique?.tentatives ?? 0;

        const pourcentage =
          activite.total !== null && activite.total > 0
            ? Math.min(
                100,
                Math.round(
                  (travaillees / activite.total) * 100,
                ),
              )
            : null;

        return {
          type: activite.type,
          titre: activite.titre,
          total: activite.total,
          travaillees,
          reussies,
          tentatives,
          pourcentage,
        };
      });
  });

  // -----------------------------------------------------
  // Totaux du permis sélectionné
  // -----------------------------------------------------

  readonly totalTravaillees = computed(() =>
    this.cartes().reduce(
      (total, carte) => total + carte.travaillees,
      0,
    ),
  );

  readonly totalReussies = computed(() =>
    this.cartes().reduce(
      (total, carte) => total + carte.reussies,
      0,
    ),
  );

  // -----------------------------------------------------
  // Initialisation
  // -----------------------------------------------------

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  // -----------------------------------------------------
  // Changement de permis
  // -----------------------------------------------------

  changerPermis(permis: Permis): void {
    this.permis.set(permis);
  }

  // -----------------------------------------------------
  // Chargement
  // -----------------------------------------------------

  private chargerStatistiques(): void {

    this.chargement.set(true);
    this.erreur.set(null);

    this._progressionService
      .getStatistiques()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => this.chargement.set(false)),
      )
      .subscribe({
        error: error => {
          console.error(error);

          this.erreur.set(
            'Impossible de charger les statistiques.',
          );
        },
      });
  }
}
