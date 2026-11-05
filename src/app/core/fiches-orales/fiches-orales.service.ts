
import {
    Injectable,
    Signal,
    signal,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { SignalStateService } from '../services/signal-state-service';

import {
    FicheOrale,
    FichesOrales,
    FicheOraleEntrainement,
    FicheOraleCorrection,
} from './fiches-orales.types';
import { Permis } from '../permis/permis.types';

// -----------------------------------------------------
// State
// -----------------------------------------------------

interface FichesOralesState {
    fiche: FicheOrale | null;
    fiches: FichesOrales;
    entrainement: FicheOraleEntrainement | null;
    correction: FicheOraleCorrection | null;
}

@Injectable({ providedIn: 'root' })
export class FichesOralesService extends SignalStateService<FichesOralesState> {

    private _permis = signal<Permis>('C');

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
        super({
            fiche: null,
            fiches: [],
            entrainement: null,
            correction: null,
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get fiche(): Signal<FicheOrale | null> {
        return this.select('fiche');
    }

    get fiches(): Signal<FichesOrales> {
        return this.select('fiches');
    }

    get entrainement(): Signal<FicheOraleEntrainement | null> {
        return this.select('entrainement');
    }

    get correction(): Signal<FicheOraleCorrection | null> {
        return this.select('correction');
    }

    get permis(): Signal<Permis> {
        return this._permis.asReadonly();
    }

    setPermis(permis: Permis): void {
        this._permis.set(permis);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Récupérer les fiches orales par permis.
     */
    public getFiches(): Observable<FichesOrales> {
        console.log('lol',this._permis());
        
        return this._httpClient.get<FichesOrales>(
            `/api/fiches-orales/${this._permis()}`,
        ).pipe(
            tap((fiches) => {
                this.setState({ fiches });
            })
        );
    }

    /**
     * Récupérer une fiche orale par numéro.
     */
    public getFicheByNumero(
        numero: number
    ): Observable<FicheOrale> {
        return this._httpClient.get<FicheOrale>(
            `/api/fiches-orales/numero/${numero}`
        ).pipe(
            tap((fiche) => {
                this.setState({ fiche });
            })
        );
    }

    /**
     * Récupérer l'entraînement d'un point.
     */
    public getEntrainement(
        numero: number,
        pointId: string
    ): Observable<FicheOraleEntrainement> {
        return this._httpClient.get<FicheOraleEntrainement>(
            `/api/fiches-orales/${numero}/points/${encodeURIComponent(pointId)}/entrainement`
        ).pipe(
            tap((entrainement) => {
                this.setState({ entrainement });
            })
        );
    }

    /**
     * Récupérer la correction d'un point.
     */
    public getCorrection(
        numero: number,
        pointId: string
    ): Observable<FicheOraleCorrection> {
        return this._httpClient.get<FicheOraleCorrection>(
            `/api/fiches-orales/${numero}/points/${encodeURIComponent(pointId)}/correction`
        ).pipe(
            tap((correction) => {
                this.setState({ correction });
            })
        );
    }
}
