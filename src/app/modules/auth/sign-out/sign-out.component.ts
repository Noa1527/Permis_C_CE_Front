import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, take, takeUntil, timer } from 'rxjs';

import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-out',
    standalone: true,
    templateUrl: './sign-out.component.html',
    imports: [RouterLink],
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown = 5;
    signingOut = false;
    signedOut = false;
    errorMessage = '';

    private readonly _destroy$ = new Subject<void>();

    constructor(
        private readonly _authService: AuthService,
        private readonly _router: Router,
    ) {}

    ngOnInit(): void {
        this.signOut();
    }

    signOut(): void {
        if (this.signingOut || this.signedOut) {
            return;
        }

        this.signingOut = true;
        this.errorMessage = '';
        this.countdown = 5;

        this._authService.signOut()
            .pipe(
                take(1),
                takeUntil(this._destroy$),
            )
            .subscribe({
                next: () => {
                    this.signingOut = false;
                    this.signedOut = true;
                    this.startCountdown();
                },
                error: () => {
                    this.signingOut = false;
                    this.errorMessage =
                        'La déconnexion a échoué. Vérifie ta connexion et réessaie.';
                },
            });
    }

    private startCountdown(): void {
        timer(1000, 1000)
            .pipe(
                take(5),
                takeUntil(this._destroy$),
            )
            .subscribe((tick) => {
                this.countdown = 4 - tick;

                if (this.countdown === 0) {
                    void this._router.navigateByUrl('/sign-in');
                }
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}