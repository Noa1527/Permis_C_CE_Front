import { Routes } from '@angular/router';
import { Profile } from 'src/app/modules/profile/profile';
import { connectedUserResolver } from 'src/app/core/user/users.resolver';
import { Progression } from './progression';
export default [
    {
        path     : '',
        component: Progression,
        // resolve  : {
        //     user: connectedUserResolver,
        // }
    },
] as Routes;
