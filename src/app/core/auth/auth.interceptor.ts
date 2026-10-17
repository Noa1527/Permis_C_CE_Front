import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Le navigateur envoie le cookie HttpOnly au backend.
    const newReq = req.clone({
        withCredentials: true,
    });

    // Les erreurs d’authentification sont gérées par
    // le service, la page de connexion ou le guard.
    const isAuthRequest = req.url.includes('/api/auth/');

    return next(newReq).pipe(
        catchError((error: unknown) => {
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !isAuthRequest
            ) {
                authService.isAuthenticated = false;

                void router.navigate(['/sign-in']);
            }

            return throwError(() => error);
        }),
    );
};