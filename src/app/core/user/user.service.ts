import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FindUserDto, UpdateUser, User, Users } from 'src/app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _users: ReplaySubject<Users> = new ReplaySubject<Users>(1);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    get users$(): Observable<Users> {
        return this._users.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('/api/users/own').pipe(
            tap((user) => {
                console.log('user service',user);
                
                this._user.next(user);
            })
        );
    }

    updateProfile(user: UpdateUser): Observable<any> {
        return this._httpClient.patch<User>('/api/users/me', user).pipe(
            map((response) => {
                this._user.next(response);
            }),
        );
    }


    /**
     * Get the current logged in user data
     */
    getAll(options = new FindUserDto): Observable<Users> {
        let params = new HttpParams();

       

        return this._httpClient.get<Users>('/api/users/', { params }).pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }

    getOne(id: string): Observable<User> {
        return this._httpClient.get<User>(`/api/users/${id}`).pipe(
            tap((user) => {
                this._user.next(user);
            }),
        );
    }

    create(form: User): Observable<User> {
        return this._httpClient.post<User>(`/api/users/`, form).pipe(
            tap(() => {
                return this.get().subscribe();
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(id: string, user: User): Observable<any> {
        return this._httpClient.patch<User>('/api/users/' + id, user).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }

    remove(id: string): Observable<void> {
        return this._httpClient.delete<void>(`/api/users/${id}`).pipe(
            tap(() => {
                return this.get().subscribe();
            })
        );
    }
}
