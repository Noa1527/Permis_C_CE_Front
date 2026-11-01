import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DashboardService } from 'src/app/core/dashboard/dashboard.service';
import { Permit } from 'src/app/core/dashboard/dashboard.types';
import { ProgressionService } from 'src/app/core/progression/progression.service';
import { ProgressionType } from 'src/app/core/progression/progression.types';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    @ViewChild('progressCarousel')
    private _carousel?: ElementRef<HTMLDivElement>;

    private readonly _dashboardService = inject(DashboardService);
    private readonly _progressionService = inject(ProgressionService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _injector = inject(Injector);

    public permits = this._dashboardService.permits;
    public activities = this._dashboardService.activities;

    public selectedPermit = this._dashboardService.selectedPermit;
    public progress = this._progressionService.statistiques;

    // public hasProgress = this._dashboardService.hasProgress;
    // public progressCards = this._dashboardService.progressCards;
   
    public chargementProgression = signal(false);
    public erreurProgression = signal<string | null>(null);

    // -----------------------------------------------------
    // Carrousel infini
    // -----------------------------------------------------

    public carouselCards = computed(() => {
        const cards = this.progressCards();

        return [...cards, ...cards, ...cards];
    });

    // -----------------------------------------------------
    // Configuration des cartes du Dashboard
    // -----------------------------------------------------

    private readonly _progressionConfig: {
        label: string;
        type: ProgressionType;
        total: number | null;
        onlyCE?: boolean;
    }[] = [
        {
            label: 'Questions écrites',
            type: ProgressionType.WRITING_QUESTION,
            total: 200,
        },
        {
            label: 'Fiches orales',
            type: ProgressionType.ORAL_SHEET,
            total: 12,
        },
        {
            label: 'Thèmes',
            type: ProgressionType.THEME,
            total: 6,
        },
        {
            label: 'Vérifications',
            type: ProgressionType.VERIFICATION,
            total: null,
        },
        {
            label: 'Maniabilité',
            type: ProgressionType.MANIABILITE,
            total: null,
        },
        {
            label: 'Attelage / Dételage',
            type: ProgressionType.ATTELAGE_DETELAGE,
            total: null,
            onlyCE: true,
        },
        {
            label: 'Examens blancs',
            type: ProgressionType.EXAMEN_BLANC,
            total: null,
        },
        {
            label: 'Plateau',
            type: ProgressionType.PLATEAU,
            total: null,
        },
    ];

    

    // -----------------------------------------------------
    // Cartes de progression dynamiques
    // -----------------------------------------------------

    public readonly progressCards = computed(() => {

    const permis = this.selectedPermit();
    const statistiques = this._progressionService.statistiques();

    return this._progressionConfig
        .filter(config => !config.onlyCE || permis === 'CE')
        .map(config => {

        // Recherche des statistiques correspondantes
        const statistique = statistiques.find(
            item =>
            item._id.permis === permis &&
            item._id.type === config.type,
        );

        const travaillees = statistique?.travaillees ?? 0;
        const reussies = statistique?.reussies ?? 0;
        const tentatives = statistique?.tentatives ?? 0;

        return {
            label: config.label,
            value: travaillees,
            total: config.total,
            reussies,
            tentatives,
            detail: `${reussies} réussies au dernier essai · ${tentatives} tentatives`,
        };
        });
    });

    // -----------------------------------------------------
    // Vérifier si l'utilisateur possède une progression
    // -----------------------------------------------------

    public hasProgress = computed(() => {

        const permis = this.selectedPermit();

        return this._progressionService.statistiques().some(
            item =>
            item._id.permis === permis &&
            item.travaillees > 0,
        );
    });

    // -----------------------------------------------------
    // Initialisation
    // -----------------------------------------------------

    ngOnInit(): void {
        this.loadProgression();
    }

    // -----------------------------------------------------
    // Actions
    // -----------------------------------------------------


  private loadProgression(): void {

    this.chargementProgression.set(true);
    this.erreurProgression.set(null);

    this._progressionService
      .getStatistiques()
      .pipe(
        finalize(() => {
          this.chargementProgression.set(false);
        }),
      )
      .subscribe({
        error: error => {
          console.error(
            'Erreur chargement progression :',
            error,
          );

          this.erreurProgression.set(
            'Impossible de charger la progression.',
          );
        },
      });
  }

  // -----------------------------------------------------
  // Sélection du permis
  // -----------------------------------------------------

  selectPermit(permit: Permit): void {
    this._dashboardService.selectPermit(permit);
  }

   // -----------------------------------------------------
  // Mesurer la largeur d'une carte + l'espace
  // -----------------------------------------------------

  private getCardStep(): number {

    const element = this._carousel?.nativeElement;

    if (!element || element.children.length < 2) {
      return 0;
    }

    const first = element.children[0] as HTMLElement;
    const second = element.children[1] as HTMLElement;

    return second.offsetLeft - first.offsetLeft;
  }

  // -----------------------------------------------------
  // Positionner au milieu des trois séries
  // -----------------------------------------------------

  private centrerCarousel(): void {

    const element = this._carousel?.nativeElement;
    if (!element) return;

    const count = this.progressCards().length;
    const step = this.getCardStep();

    if (!count || !step) return;

    element.scrollLeft = count * step;
  }

  private planifierCentrage(): void {

    if (this._destroyRef.destroyed) return;

    afterNextRender(
      () => {
        if (!this._destroyRef.destroyed) {
          this.centrerCarousel();
        }
      },
      { injector: this._injector },
    );
  }

  // -----------------------------------------------------
  // Boutons précédent / suivant
  // -----------------------------------------------------

  defiler(direction: -1 | 1): void {

    const element = this._carousel?.nativeElement;
    const step = this.getCardStep();

    if (!element || !step) return;

    element.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  }

  // -----------------------------------------------------
  // Boucle infinie
  // -----------------------------------------------------

  ajusterBoucle(): void {

    const element = this._carousel?.nativeElement;
    if (!element) return;

    const count = this.progressCards().length;
    const step = this.getCardStep();

    if (count < 2 || !step) return;

    const largeurSerie = count * step;
    const position = element.scrollLeft;

    // Trop à gauche : replacer sur la série suivante
    if (position < largeurSerie * 0.5) {

      element.scrollLeft = position + largeurSerie;

    // Trop à droite : replacer sur la série précédente
    } else if (position > largeurSerie * 1.5) {

      element.scrollLeft = position - largeurSerie;
    }
  }


  // -----------------------------------------------------
  // Calcul du pourcentage
  // -----------------------------------------------------

  percentage(
    value: number,
    total: number | null,
  ): number {

    if (total === null || total <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round((value / total) * 100),
      ),
    );
  }
}