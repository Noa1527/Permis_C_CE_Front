import { HttpErrorResponse } from '@angular/common/http';
import {
    Component,
    ViewEncapsulation,
    signal,
} from '@angular/core';
import {
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        RouterLink,
        ReactiveFormsModule,
    ],
})
export class AuthSignInComponent {
    readonly signInForm: UntypedFormGroup;

    readonly showPassword = signal(false);
    readonly loading = signal(false);
    readonly error = signal('');

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    ) {
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    get emailInvalid(): boolean {
        const control = this.signInForm.controls['email'];

        return control.touched && control.invalid;
    }

    get passwordInvalid(): boolean {
        const control = this.signInForm.controls['password'];

        return control.touched && control.invalid;
    }

    togglePassword(): void {
        this.showPassword.update((visible) => !visible);
    }

    /**
     * Connexion avec l'e-mail et le mot de passe.
     */
    signIn(): void {
        if (this.loading()) return;

        this.error.set('');

        const emailControl = this.signInForm.controls['email'];

        emailControl.setValue(
            String(emailControl.value ?? '').trim(),
        );

        if (this.signInForm.invalid) {
            this.signInForm.markAllAsTouched();
            return;
        }

        const { email, password } = this.signInForm.getRawValue();

        this.loading.set(true);
        this.signInForm.disable();

        // Ton AuthService fourni attend "userName".
        this._authService.signIn({
            email,
            password,
        })
            .pipe(
                finalize(() => {
                    this.signInForm.enable();
                    this.loading.set(false);
                }),
            )
            .subscribe({
                next: () => {
                    const requestedUrl =
                        this._activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL',
                        );

                    const redirectURL =
                        requestedUrl?.startsWith('/') &&
                        !requestedUrl.startsWith('//')
                            ? requestedUrl
                            : '/signed-in-redirect';

                    void this._router.navigateByUrl(redirectURL);
                },
                error: (response: HttpErrorResponse) => {
                    this.signInForm.controls['password'].reset('');
                    this.showPassword.set(false);

                    this.error.set(
                        response.status === 401
                            ? 'Adresse e-mail ou mot de passe incorrect.'
                            : 'Connexion impossible. Réessaie dans un instant.',
                    );
                },
            });
    }
}