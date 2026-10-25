
import { Injectable, Signal, signal } from '@angular/core';
import { SignalStateService } from '../services/signal-state-service';
import { HttpClient } from '@angular/common/http';
import { Question, Questions, PermisType } from './questions-ecrites.types';
import { Observable, tap } from 'rxjs';


interface QuestionState {
    question: Question,
    questions: Questions
}

@Injectable({providedIn: 'root'})
export class QuestionsEcritesService extends SignalStateService<QuestionState>{

  /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient) {
        super({
            question: {} as Question,
            questions: [] as Questions
        });
    }  


 // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for question
     *
     * @param value
     */
    get question(): Signal<Question> {
        return this.select('question');
    }

    get questions(): Signal<Questions> {
        return this.select('questions');
    }

    get permis(): Signal<PermisType> {
        return this._permis.asReadonly();
    }

    setPermis(permis: PermisType): void {
        this._permis.set(permis);
    }

    private _permis = signal<PermisType>('C');

  /**
   * Sélectionner une question au hasard.
   */
  getRandomFiche(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

    public get(): Observable<Question> {
        return this._httpClient.get<Question>('/api/questions-ecrites').pipe(
            tap((question) => {

                this.setState({question});
            })
        );
    }

    public getRandom(): Observable<Questions> {
        return this._httpClient.get<Questions>(`/api/questions-ecrites/random/${this._permis()}`).pipe(
            tap((questions) => {
                this.setState({questions});
            })
        );
    }

    public getQuestionByFicheId(ficheId: number): Observable<Questions> {
        return this._httpClient.get<Questions>(`/api/questions-ecrites/${ficheId}`).pipe(
            tap((questions) => {
                this.setState({questions});
            })
        );
    }
}
