import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    ResolveFn,
    RouterStateSnapshot,
} from '@angular/router';
import { UserService } from 'src/app/core/user/user.service';
import { User, Users } from 'src/app/core/user/user.types';

export const connectedUserResolver: ResolveFn<User> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => (
    inject(UserService).get()
)


export const usersResolver: ResolveFn<Users> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    return inject(UserService).getAll();
};

export const userResolver: ResolveFn<User> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    return inject(UserService).getOne(route.params['id']);
};
