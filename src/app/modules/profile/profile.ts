import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, map, Observable, take } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/user/user.service';
import { UpdateUser, User } from 'src/app/core/user/user.types';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private _usersService = inject(UserService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  public user!: Observable<User>;
  public fullName$!: Observable<string>;
  public initials$!: Observable<string>;

  public loading = signal(true);
  public saving = signal(false);
  public editing = signal(false);
  public error = signal<string | null>(null);
  public success = signal<string | null>(null);
  public signingOut = signal(false);


  ngOnInit() {
    this.user = this._usersService.user$;
    this.loadProfile();

      this.fullName$ = this.user.pipe(
      map((user) => {
        console.log('user',user);
        
        if (!user) return 'Utilisateur';

        return `${user.firstName} ${user.lastName}`.trim()
          || user.email;
      })
    );

    this.initials$ = this.user.pipe(
    map((user) => {
      if (!user) return 'U';

      const first = user.firstName?.charAt(0) || '';
      const last = user.lastName?.charAt(0) || '';

      return (first + last).toUpperCase() || 'U';
    })
  );
  }  

  readonly form = {
    firstName: '',
    lastName: '',
  };

  // public fullName$ = 

  // Initiales
  // public  initials$ = this.user.pipe(
  //   map((user) => {
  //     if (!user) return 'U';

  //     const first = user.firstName?.charAt(0) || '';
  //     const last = user.lastName?.charAt(0) || '';

  //     return (first + last).toUpperCase() || 'U';
  //   })
  // );

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this._usersService.get()
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.form.firstName = user.firstName;
          this.form.lastName = user.lastName;
        },
        error: () => {
          this.error.set(
            'Impossible de charger votre profil.',
          );
        },
      });
  }

editProfile(): void {
  this.user.pipe(
    take(1)
  ).subscribe((user) => {
    if (!user) return;

    this.form.firstName = user.firstName;
    this.form.lastName = user.lastName;

    this.error.set(null);
    this.success.set(null);
    this.editing.set(true);
  });
}

  cancelEdit(): void {
    this.editing.set(false);
    this.error.set(null);
  }

  saveProfile(): void {
    if (this.saving()) return;

    const data: UpdateUser = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
    };

    if (!data.firstName || !data.lastName) {
      this.error.set(
        'Le prénom et le nom sont obligatoires.',
      );
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this._usersService.updateProfile(data)
      .pipe(
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.editing.set(false);
          this.success.set(
            'Votre profil a été mis à jour.',
          );
        },
        error: () => {
          this.error.set(
            'Une erreur est survenue lors de la modification.',
          );
        },
      });
  }



signOut(): void {
  if (this.signingOut()) return;

  this.signingOut.set(true);

  this._authService.signOut()
    .pipe(
      finalize(() => this.signingOut.set(false))
    )
    .subscribe({
      next: () => {
        this._router.navigateByUrl('/sign-in');
      },
      error: () => {
        this.error.set(
          'Impossible de vous déconnecter. Veuillez réessayer.'
        );
      },
    });
}
}
