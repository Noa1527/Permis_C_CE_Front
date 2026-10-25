import { Routes } from '@angular/router';
import { QuestionsEcrites } from 'src/app/modules/questions-ecrites/questions-ecrites';
import { Entrainement } from './entrainement/entrainement';
export default [
    {
        path     : '',
        component: QuestionsEcrites,
    },
    {
        path     : 'entrainement',
        component: Entrainement,
    },
] as Routes;
