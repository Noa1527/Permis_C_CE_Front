import { Routes } from '@angular/router';
import { Profile } from 'src/app/modules/profile/profile';
import { connectedUserResolver } from 'src/app/core/user/users.resolver';
export default [
    {
        path     : '',
        component: Profile,
        resolve  : {
            user: connectedUserResolver,
        }
    },
] as Routes;
