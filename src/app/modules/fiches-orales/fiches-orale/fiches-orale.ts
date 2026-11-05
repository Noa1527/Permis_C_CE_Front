import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { FichesOralesService } from 'src/app/core/fiches-orales/fiches-orales.service';

@Component({
  selector: 'app-fiches-orale',
  imports: [RouterLink],
  templateUrl: './fiches-orale.html',
  styleUrl: './fiches-orale.scss',
})
export class FichesOrale implements OnInit {

    private readonly _fichesOralesService = inject(FichesOralesService);

    private readonly _route = inject(ActivatedRoute);
    private readonly _destroyRef = inject(DestroyRef);

    // -----------------------------------------------------
    // Signals du service
    // -----------------------------------------------------

    public readonly fiche = this._fichesOralesService.fiche;
    public readonly permis = this._fichesOralesService.permis;

    // -----------------------------------------------------
    // Signals du composant
    // -----------------------------------------------------

    public readonly loading = signal(true);
    public readonly error = signal<string | null>(null);

    public readonly openedPointId = signal<string | null>(null);

    // -----------------------------------------------------
    // Computed
    // -----------------------------------------------------

    public readonly totalPoints = computed(() =>
        this.fiche()?.sections.reduce(
            (total, section) => total + section.points.length,
            0,
        ) ?? 0
    );

    public readonly totalMinutes = computed(
        () => this.totalPoints() * 7
    );

    // -----------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------

    ngOnInit(): void {
        combineLatest([
            this._route.paramMap,
            this._route.queryParamMap,
        ]).pipe(
            map(([params, queryParams]) => ({
                numero: Number(params.get('numero')),
                permit: queryParams.get('permit'),
            })),

            distinctUntilChanged(
                (previous, current) =>
                    previous.numero === current.numero &&
                    previous.permit === current.permit
            ),

            switchMap(({ numero, permit }) => {
                this.loading.set(true);
                this.error.set(null);
                this.openedPointId.set(null);

                if (
                    !Number.isInteger(numero) ||
                    numero < 1 ||
                    numero > 12
                ) {
                    this.error.set('Numéro de fiche invalide.');
                    return of(null);
                }

                if (
                    permit !== 'C' &&
                    permit !== 'CE'
                ) {
                    this.error.set('Permis invalide.');
                    return of(null);
                }

                this._fichesOralesService.setPermis(permit);

                return this._fichesOralesService
                    .getFicheByNumero(numero)
                    .pipe(
                        catchError(() => {
                            this.error.set(
                                'Impossible de charger cette fiche orale.'
                            );
                            return of(null);
                        })
                    );
            }),

            takeUntilDestroyed(this._destroyRef),
        ).subscribe((fiche) => {
            if (fiche) {
                console.log('fiche',fiche);
                
                // Ouvrir automatiquement le premier point
                const premierPoint = fiche.sections[0]?.points[0];

                this.openedPointId.set(
                    premierPoint?.id ?? null
                );
            }

            this.loading.set(false);
        });
    }

    // -----------------------------------------------------
    // Affichage des cours
    // -----------------------------------------------------

    public togglePoint(pointId: string): void {
        this.openedPointId.update(
            current => current === pointId ? null : pointId
        );
    }
}