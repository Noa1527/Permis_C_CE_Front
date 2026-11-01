
import { HttpClient } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { SignalStateService } from 'src/app/core/services/signal-state-service';
import { EnregistrerTentativeDto, ProgressionStatistique, ProgressionStatistiques } from 'src/app/core/progression/progression.types';
import { Permis } from 'src/app/core/permis/permis.types';

interface ProgressionState {
  statistique: ProgressionStatistique;
  statistiques: ProgressionStatistiques;
}

@Injectable({ providedIn: 'root' })
export class ProgressionService extends SignalStateService<ProgressionState> {

  constructor(private _httpClient: HttpClient) {
    super({
      statistique: {} as ProgressionStatistique,
      statistiques: [] as ProgressionStatistiques,
    });
  }

  // -----------------------------------------------------
  // Signals
  // -----------------------------------------------------

  get statistique(): Signal<ProgressionStatistique> {
    return this.select('statistique');
  }

  get statistiques(): Signal<ProgressionStatistiques> {
    return this.select('statistiques');
  }

  // -----------------------------------------------------
  // Charger les statistiques
  // -----------------------------------------------------

    public getByPermis( permis: Permis): Observable<ProgressionStatistiques> {

        return this._httpClient.get<ProgressionStatistiques>('/api/progression',
            { params: { permis } },
        ).pipe(
            tap((statistiques) => {
                console.log('statistiques',statistiques);
                
            this.setState({ statistiques });
            }),
        );
    }

    getStatistiques(): Observable<ProgressionStatistiques> {

      return this._httpClient
        .get<ProgressionStatistiques>('/api/progression')
        .pipe(
          tap(statistiques => {
            this.setState({ statistiques });
          }),
        );
    }

  // -----------------------------------------------------
  // Enregistrer une tentative
  // -----------------------------------------------------

    public enregistrerTentative( form: EnregistrerTentativeDto ): Observable<ProgressionStatistiques> {
        console.log('form', form);
        
        return this._httpClient
          .post<ProgressionStatistiques>( '/api/progression/tentatives', form ).pipe(
            tap((statistiques) => {
              this.setState({ statistiques });
            }),
        );
    }
}
