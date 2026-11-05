import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, EMPTY, map, Subscription, switchMap, timer } from 'rxjs';
import { FichesOralesService } from 'src/app/core/fiches-orales/fiches-orales.service';
import { EtapeEntrainement, FicheOraleCritere } from 'src/app/core/fiches-orales/fiches-orales.types';

@Component({
  selector: 'app-fiches-orale-entrainement',
  imports: [RouterLink],
  templateUrl: './fiches-orale-entrainement.html',
  styleUrl: './fiches-orale-entrainement.scss',
})
export class FichesOraleEntrainement implements OnInit {

    private readonly _service = inject(FichesOralesService);
    private readonly _route = inject(ActivatedRoute);
    private readonly _destroyRef = inject(DestroyRef);

    private _chronoSubscription?: Subscription;
    private _correctionSubscription?: Subscription;

    // -----------------------------------------------------
    // Signals provenant du service
    // -----------------------------------------------------

    public readonly entrainement = this._service.entrainement;
    public readonly correction = this._service.correction;
    public readonly permis = this._service.permis;

    // -----------------------------------------------------
    // Signals du composant
    // -----------------------------------------------------

    public readonly numero = signal(0);
    public readonly pointId = signal('');

    public readonly loading = signal(true);
    public readonly error = signal<string | null>(null);
    public readonly errorCorrection = signal<string | null>(null);

    public readonly etape = signal<EtapeEntrainement>('pret');

    public readonly reponse = signal('');

    public readonly dureeSecondes = signal(420);
    public readonly tempsRestant = signal(420);

    public readonly criteresSelectionnes =
        signal<Set<string>>(new Set());

    // -----------------------------------------------------
    // Computed
    // -----------------------------------------------------

    public readonly titrePoint = computed(() =>
        this.pointId().replace(/-/g, ' ')
    );

    /**
     * Affichage du temps : 07:00
     */
    public readonly tempsAffiche = computed(() => {
        const secondes = this.tempsRestant();

        const minutes = Math.floor(secondes / 60);
        const reste = secondes % 60;

        return (
            String(minutes).padStart(2, '0') +
            ':' +
            String(reste).padStart(2, '0')
        );
    });

    /**
     * Progression de la barre du chronomètre.
     */
    public readonly progressionChrono = computed(() => {
        const duree = this.dureeSecondes();

        if (duree <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                ((duree - this.tempsRestant()) / duree) * 100
            )
        );
    });

    /**
     * Nombre de critères de correction.
     */
    public readonly totalCriteres = computed(() =>
        this.correction()?.criteres.length ?? 0
    );

    /**
     * Nombre de critères sélectionnés.
     */
    public readonly totalValides = computed(() =>
        this.criteresSelectionnes().size
    );

    /**
     * Score d'autocorrection en pourcentage.
     */
    public readonly score = computed(() => {
        const total = this.totalCriteres();

        if (total === 0) {
            return 0;
        }

        return Math.round(
            (this.totalValides() / total) * 100
        );
    });

    /**
     * Critères cochés avec au moins un mot-clé
     * retrouvé dans la réponse écrite.
     */
    public readonly totalIndicesReperes = computed(() => {
        const criteres = this.correction()?.criteres ?? [];

        return criteres.filter(critere =>
            this.criteresSelectionnes().has(critere.id) &&
            this.repereMotCle(critere)
        ).length;
    });

    // -----------------------------------------------------
    // Constructor
    // -----------------------------------------------------

    constructor() {
        this._destroyRef.onDestroy(() => {
            this._chronoSubscription?.unsubscribe();
            this._correctionSubscription?.unsubscribe();
        });
    }

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
                pointId: params.get('pointId') ?? '',
                permit: queryParams.get('permit'),
            })),

            distinctUntilChanged((a, b) =>
                a.numero === b.numero &&
                a.pointId === b.pointId &&
                a.permit === b.permit
            ),

            switchMap(({ numero, pointId, permit }) => {

                this.reinitialiser();

                // Vérifier le numéro et le point.
                if (
                    !Number.isInteger(numero) ||
                    numero < 1 ||
                    numero > 12 ||
                    !pointId
                ) {
                    this.error.set(
                        'Numéro de fiche ou point invalide.'
                    );

                    this.loading.set(false);

                    return EMPTY;
                }

                // Vérifier le permis.
                if (
                    permit !== 'C' &&
                    permit !== 'CE'
                ) {
                    this.error.set(
                        'Permis invalide dans l’URL.'
                    );

                    this.loading.set(false);

                    return EMPTY;
                }

                this.numero.set(numero);
                this.pointId.set(pointId);

                this._service.setPermis(permit);

                // Requête HTTP conservée dans le service.
                return this._service.getEntrainement(
                    numero,
                    pointId
                ).pipe(
                    catchError(() => {
                        this.error.set(
                            'Impossible de charger cet entraînement.'
                        );

                        this.loading.set(false);

                        return EMPTY;
                    })
                );
            }),

            takeUntilDestroyed(this._destroyRef),

        ).subscribe(entrainement => {

            const duree =
                Number.isFinite(entrainement.dureeSecondes) &&
                entrainement.dureeSecondes > 0
                    ? Math.floor(entrainement.dureeSecondes)
                    : 420;

            this.dureeSecondes.set(duree);
            this.tempsRestant.set(duree);

            this.loading.set(false);
        });
    }

    // -----------------------------------------------------
    // Réinitialiser l'entraînement
    // -----------------------------------------------------

    private reinitialiser(): void {

        this._chronoSubscription?.unsubscribe();
        this._correctionSubscription?.unsubscribe();

        this.loading.set(true);

        this.error.set(null);
        this.errorCorrection.set(null);

        this.etape.set('pret');

        this.reponse.set('');

        this.dureeSecondes.set(420);
        this.tempsRestant.set(420);

        this.criteresSelectionnes.set(new Set());
    }

    // -----------------------------------------------------
    // Démarrer les 7 minutes
    // -----------------------------------------------------

    public commencer(): void {

        if (
            this.etape() !== 'pret' ||
            this.loading()
        ) {
            return;
        }

        // Date exacte de fin du chronomètre.
        const fin = Date.now() +
            this.dureeSecondes() * 1000;

        this.etape.set('redaction');

        this._chronoSubscription?.unsubscribe();

        this._chronoSubscription = timer(0, 250)
            .pipe(
                takeUntilDestroyed(this._destroyRef)
            )
            .subscribe(() => {

                const secondes = Math.max(
                    0,
                    Math.ceil(
                        (fin - Date.now()) / 1000
                    )
                );

                this.tempsRestant.set(secondes);

                if (secondes === 0) {
                    this.terminerChronometre();
                }
            });
    }

    // -----------------------------------------------------
    // Mettre à jour la réponse
    // -----------------------------------------------------

    public mettreAJourReponse(event: Event): void {

        if (this.etape() !== 'redaction') {
            return;
        }

        const textarea =
            event.target as HTMLTextAreaElement;

        this.reponse.set(textarea.value);
    }

    // -----------------------------------------------------
    // Fin du chronomètre
    // -----------------------------------------------------

    private terminerChronometre(): void {

        if (this.etape() !== 'redaction') {
            return;
        }

        this._chronoSubscription?.unsubscribe();

        this.tempsRestant.set(0);

        this.etape.set('chargement-correction');

        this.chargerCorrection();
    }

    // -----------------------------------------------------
    // Récupérer la correction après 7 minutes
    // -----------------------------------------------------

    public chargerCorrection(): void {

        if (
            this.etape() !== 'chargement-correction' ||
            this.tempsRestant() !== 0
        ) {
            return;
        }

        this._correctionSubscription?.unsubscribe();

        this.errorCorrection.set(null);

        this._correctionSubscription =
            this._service.getCorrection(
                this.numero(),
                this.pointId()
            ).pipe(
                takeUntilDestroyed(this._destroyRef)
            ).subscribe({

                next: () => {
                    this.etape.set('autocorrection');
                },

                error: () => {
                    this.errorCorrection.set(
                        'Impossible de récupérer la correction.'
                    );
                },
            });
    }

    // -----------------------------------------------------
    // Cocher / décocher un critère
    // -----------------------------------------------------

    public basculerCritere(id: string): void {

        if (this.etape() !== 'autocorrection') {
            return;
        }

        this.criteresSelectionnes.update(anciens => {

            const suivants = new Set(anciens);

            if (suivants.has(id)) {
                suivants.delete(id);
            } else {
                suivants.add(id);
            }

            return suivants;
        });
    }

    // -----------------------------------------------------
    // Valider l'autocorrection
    // -----------------------------------------------------

    public validerAutocorrection(): void {

        if (
            this.etape() !== 'autocorrection' ||
            this.totalCriteres() === 0
        ) {
            return;
        }

        this.etape.set('resultat');
    }

    // -----------------------------------------------------
    // Comparaison avec les mots-clés
    // -----------------------------------------------------

    public repereMotCle(
        critere: FicheOraleCritere
    ): boolean {

        const texte = ` ${this.normaliser(this.reponse())} `;

        return critere.motsCles.some(mot => {

            const recherche = this.normaliser(mot);

            return recherche.length > 0 &&
                texte.includes(` ${recherche} `);
        });
    }

    /**
     * Normaliser le texte :
     * - minuscules
     * - suppression des accents
     * - suppression de la ponctuation
     */
    private normaliser(texte: string): string {

        return texte
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim()
            .replace(/\s+/g, ' ');
    }
}
