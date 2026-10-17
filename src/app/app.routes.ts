import { Route } from '@angular/router';
// import { initialDataResolver } from 'src/app/app.resolvers';
import { AuthGuard } from 'src/app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'src/app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'src/app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        // component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('src/app/modules/auth/sign-in/sign-in.routes'),
            },
            {
                path: 'sign-up',
                loadChildren: () =>
                    import('src/app/modules/auth/sign-up/sign-up.routes'),
            },
           
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        // component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('src/app/modules/auth/sign-out/sign-out.routes'),
            }
        ],
    },

    // App routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        // resolve: {
        //     initialData: initialDataResolver,
        // },
        children: [
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('src/app/modules/dashboard/dashboard.routes'),
            },
            // {
            //     path: 'scanner',
            //     loadChildren: () =>
            //         import('src/app/modules/scan-foods/scan-foods.routes'),
            // },
            // {
            //     path: 'foods',
            //     loadChildren: () =>
            //         import('src/app/modules/foods/foods.routes'),
            // },
            // {
            //     path: 'foods/favorites',
            //     loadChildren: () =>
            //         import('src/app/modules/food-favorites/food-favorites.routes'),
            // },
            // {
            //     path: 'configuration/weight-settings',
            //     loadChildren: () =>
            //         import('src/app/modules/configuration/weight-settings/weight-settings.routes'),
            // },
        ],
    },
    { path: '**', redirectTo: '' },
];
