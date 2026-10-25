import { computed, Injectable, Signal } from '@angular/core';

import { SignalStateService } from 'src/app/core/services/signal-state-service';

import {
    DashboardActivity,
    DashboardProgress,
    DashboardProgressCard,
    DashboardState,
    Permit,
} from './dashboard.types';

function createEmptyProgress(): DashboardProgress {
    return {
        writtenPracticed: 0,
        writtenCorrect: 0,
        oralStudied: 0,
        checksStudied: 0,
    };
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends SignalStateService<DashboardState> {
    readonly permits: Permit[] = ['C', 'CE'];

    readonly activities: DashboardActivity[] = [
        {
            title: 'Questions écrites',
            description:
                'Entraîne-toi et comprends les réponses, question après question.',
            badge: 'Entraînement',
            action: 'Réviser les questions',
            path: '/questions-ecrites',
            icon:
                'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3M8 2h8v4H8zM7 11h10M7 15h6',
        },
        {
            title: 'Fiches orales',
            description:
                'Retiens les idées importantes et entraîne-toi à les expliquer.',
            badge: '12 fiches',
            action: 'Découvrir les fiches',
            path: '/revisions/fiches',
            icon:
                'M12 5v16M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1M12 5c3-2 7-2 10-1v16c-3-1-7-1-10 1',
        },
        {
            title: 'Vérifications',
            description:
                'Apprends les contrôles du véhicule dans un ordre clair.',
            badge: '6 thèmes',
            action: 'Revoir les contrôles',
            path: '/revisions/verifications',
            icon:
                'M3 16V6h11v10M14 9h4l3 4v3h-1M9 16h7M3 16h2M18 9v4h3M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
        },
        {
            title: 'Examen blanc',
            description:
                'Teste tes connaissances et repère les points à retravailler.',
            badge: 'Mise en situation',
            action: 'Accéder aux examens',
            path: '/examens',
            icon:
                'M9 2h6M12 6v2M19 5l2 2M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 10v4l3 2',
        },
    ];

    // Sélecteurs créés une seule fois.
    private readonly _selectedPermit = this.select('selectedPermit');

    private readonly _progressByPermit = this.select('progressByPermit');

    // Données dérivées de l’état.
    private readonly _progress = computed<DashboardProgress>(() => {
        return this._progressByPermit()[this._selectedPermit()];
    });

    private readonly _hasProgress = computed(() => {
        const progress = this._progress();

        return (
            progress.writtenPracticed > 0 ||
            progress.oralStudied > 0 ||
            progress.checksStudied > 0
        );
    });

    private readonly _progressCards = computed<DashboardProgressCard[]>(() => {
        const progress = this._progress();

        return [
            {
                label: 'Questions travaillées',
                value: progress.writtenPracticed,
                total: 200,
                detail:
                    `${progress.writtenCorrect} réussies au dernier essai`,
            },
            {
                label: 'Fiches étudiées',
                value: progress.oralStudied,
                total: 12,
                detail: 'Pour préparer ton interrogation orale',
            },
            {
                label: 'Thèmes étudiés',
                value: progress.checksStudied,
                total: 6,
                detail: 'Pour revoir les vérifications du véhicule',
            },
        ];
    });

    constructor() {
        super({
            selectedPermit: 'C',
            progressByPermit: {
                C: createEmptyProgress(),
                CE: createEmptyProgress(),
            },
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get selectedPermit(): Signal<Permit> {
        return this._selectedPermit;
    }

    get progressByPermit(): Signal<Record<Permit, DashboardProgress>> {
        return this._progressByPermit;
    }

    get progress(): Signal<DashboardProgress> {
        return this._progress;
    }

    get hasProgress(): Signal<boolean> {
        return this._hasProgress;
    }

    get progressCards(): Signal<DashboardProgressCard[]> {
        return this._progressCards;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    selectPermit(permit: Permit): void {
        this.setState({
            selectedPermit: permit,
        });
    }

    /**
     * Met à jour la progression d’un permis sans modifier l’autre.
     * À utiliser lors de la réception des données du backend.
     */
    updateProgress(permit: Permit, progress: DashboardProgress): void {
        this.setState({
            progressByPermit: {
                ...this._progressByPermit(),
                [permit]: { ...progress },
            },
        });
    }

    /**
     * À appeler à la déconnexion pour effacer les données de l’utilisateur.
     */
    reset(): void {
        this.setState({
            selectedPermit: 'C',
            progressByPermit: {
                C: createEmptyProgress(),
                CE: createEmptyProgress(),
            },
        });
    }
}