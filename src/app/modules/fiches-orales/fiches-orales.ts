import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { FichesOralesService } from 'src/app/core/fiches-orales/fiches-orales.service';
import { Permis } from 'src/app/core/permis/permis.types';

@Component({
  selector: 'app-fiches-orales',
  imports: [
    RouterLink
  ],
  standalone: true,
  templateUrl: './fiches-orales.html',
  styleUrl: './fiches-orales.scss',
})
export class FichesOrales implements OnInit {

    private readonly _fichesOralesService =
        inject(FichesOralesService);

    private readonly _route = inject(ActivatedRoute);
    private readonly _destroyRef = inject(DestroyRef);

    // Signals du service
    public readonly fiches = this._fichesOralesService.fiches;
    public readonly permis = this._fichesOralesService.permis;

    // public getRowId: GetRowIdFunc<Intervention> = (params: GetRowIdParams) =>
    // params.data._id;

    // public permisParams = params.data.permis;

    // État de la page
    public readonly loading = signal(true);
    public readonly error = signal<string | null>(null);

    // Les 12 fiches, disponibles ou non
    public readonly cards = computed(() =>
        Array.from({ length: 12 }, (_, index) => {
            const numero = index + 1;

            const fiche = this.fiches().find(
                (fiche) => fiche.numero === numero
            );

            return {
                numero,
                fiche: fiche ?? null,
            };
        })
    );

    // Nombre de fiches présentes en base
    public readonly totalDisponibles = computed(
        () => this.cards().filter(
            (card) => card.fiche !== null
        ).length
    );

    // Pourcentage de fiches importées
    public readonly pourcentageDisponibles = computed(
        () => (this.totalDisponibles() / 12) * 100
    );

    ngOnInit(): void {
    this._route.queryParamMap
        .pipe(
            map(params => params.get('permit')),
            filter((permit): permit is Permis =>
                permit === 'C' || permit === 'CE'
            ),
            distinctUntilChanged(),
            tap(permit => {
                this._fichesOralesService.setPermis(permit);
                this.loading.set(true);
                this.error.set(null);
            }),
            switchMap(() =>
                this._fichesOralesService.getFiches()
            ),
            takeUntilDestroyed(this._destroyRef)
        )
        .subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: () => {
                this.error.set(
                    'Impossible de charger les fiches orales.'
                );
                this.loading.set(false);
            }
        });
}
}
