import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/user/user.service';

import {
    BehaviorSubject,
    Observable,
    catchError,
    map,
    of,
    tap,
    throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated = false;

    private readonly _isAuthenticated =
        new BehaviorSubject<boolean>(false);

    constructor(
        private readonly _httpClient: HttpClient,
        private readonly _userService: UserService,
        private readonly _router: Router,
    ) {}

    set isAuthenticated(status: boolean) {
        this._authenticated = status;
        this._isAuthenticated.next(status);
    }

    get isAuthenticated$(): Observable<boolean> {
        return this._isAuthenticated.asObservable();
    }

    /**
     * Connexion.
     * Le backend enregistre le JWT dans un cookie HttpOnly.
     */
    signIn(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        if (this._authenticated) {
            return throwError(
                () => new Error('Tu es déjà connecté.'),
            );
        }

        return this._httpClient
            .post<any>(
                '/api/auth/sign-in',
                credentials,
                { withCredentials: true },
            )
            .pipe(
                tap((response) => {
                    if (!response?.user) {
                        throw new Error(
                            'La réponse ne contient pas l’utilisateur.',
                        );
                    }

                    this._userService.user = response.user;
                    this.isAuthenticated = true;
                }),
                catchError((error) => {
                    this.isAuthenticated = false;

                    return throwError(() => error);
                }),
            );
    }

    /**
     * Vérification de la connexion avec le cookie.
     * On conserve le nom pour tes appels existants.
     */
    signInUsingToken(): Observable<boolean> {
        return this._httpClient
            .post<any>(
                '/api/auth/sign-in-with-token',
                {},
                { withCredentials: true },
            )
            .pipe(
                map((response) => {
                    if (!response?.user) {
                        throw new Error(
                            'La réponse ne contient pas l’utilisateur.',
                        );
                    }

                    this._userService.user = response.user;
                    this.isAuthenticated = true;

                    return true;
                }),
                catchError(() => {
                    this.isAuthenticated = false;

                    return of(false);
                }),
            );
    }

    /**
     * Appelée par le guard.
     * Au rechargement, le backend vérifie le cookie.
     */
    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        return this.signInUsingToken();
    }

    /**
     * Déconnexion.
     * Le backend doit supprimer le cookie HttpOnly.
     */
    signOut(): Observable<boolean> {
        console.log("signOUT lol");
        
        return this._httpClient
            .post<void>(
                '/api/auth/sign-out',
                {},
                { withCredentials: true },
            )
            .pipe(
                map(() => {
                    this.isAuthenticated = false;

                    // Nettoyer aussi l’utilisateur ici si ton
                    // UserService propose une méthode de reset.

                    return true;
                }),
            );
    }

    /**
     * Inscription.
     */
    signUp(user: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        agreements: boolean;
    }): Observable<any> {
        return this._httpClient.post(
            '/api/auth/sign-up',
            user,
            { withCredentials: true },
        );
    }

    /**
     * Recherche du mode de connexion.
     * Cette recherche seule ne connecte pas l’utilisateur.
     */
    getAuthSystems(email: string): Observable<any> {
        return this._httpClient.get(
            '/api/auth/check-system',
            {
                params: { email },
                withCredentials: true,
            },
        );
    }
}