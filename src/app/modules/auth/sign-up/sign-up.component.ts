import { Component, inject } from '@angular/core';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from 'src/app/core/auth/auth.service';

type SignUpAlert = {
    type: 'success' | 'error';
    message: string;
};

@Component({
    selector: 'auth-sign-up',
    standalone: true,
    templateUrl: './sign-up.component.html',
    imports: [
        ReactiveFormsModule,
        RouterLink,
    ],
})
export class AuthSignUpComponent {
    private readonly _authService = inject(AuthService);
    private readonly _formBuilder = inject(NonNullableFormBuilder);
    private readonly _router = inject(Router);

    // Utilisé par le bloc d’alerte du HTML.
    alert: SignUpAlert = {
        type: 'error',
        message: '',
    };

    showAlert = false;

    // Les noms correspondent aux formControlName du HTML.
    readonly signUpForm = this._formBuilder.group({
        firstName: [
            '',
            [
                Validators.required,
                Validators.pattern(/\S/),
            ],
        ],
        lastName: [
            '',
            [
                Validators.required,
                Validators.pattern(/\S/),
            ],
        ],
        email: [
            '',
            [
                Validators.required,
                Validators.email,
            ],
        ],
        password: [
            '',
            Validators.required,
        ],
        agreements: [
            false,
            Validators.requiredTrue,
        ],
    });

    signUp(): void {
        // Empêche plusieurs requêtes pendant l’inscription.
        if (this.signUpForm.disabled) {
            return;
        }

        this.showAlert = false;

        // Nettoie les espaces accidentels, sans modifier le mot de passe.
        const values = this.signUpForm.getRawValue();

        this.signUpForm.patchValue({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
        });

        if (this.signUpForm.invalid) {
            this.signUpForm.markAllAsTouched();

            this.alert = {
                type: 'error',
                message:
                    'Vérifie les champs du formulaire et accepte les conditions pour continuer.',
            };

            this.showAlert = true;
            return;
        }

        // Récupère les données avant de désactiver le formulaire.
        const payload = this.signUpForm.getRawValue();

        // Déclenche aussi l’état de chargement dans le HTML.
        this.signUpForm.disable();

        this._authService.signUp(payload).subscribe({
            next: () => {
                // Conserve ton parcours actuel après inscription.
                void this._router.navigateByUrl('/confirmation-required');
            },
            error: () => {
                // Permet de corriger les données et de réessayer.
                this.signUpForm.enable();

                this.alert = {
                    type: 'error',
                    message:
                        'Impossible de créer ton compte. Réessaie dans quelques instants.',
                };

                this.showAlert = true;
            },
        });
    }
}