import { Routes } from '@angular/router';
import { FichesOrales } from './fiches-orales';
import { FichesOrale } from './fiches-orale/fiches-orale';
import { FichesOraleEntrainement } from './fiches-orale-entrainement/fiches-orale-entrainement';
export default [
    {
        path     : '',
        component: FichesOrales,
    },
    {
        path     : ':numero',
        component: FichesOrale,
    },
    {
        path     : ':numero/points/:pointId/entrainement',
        component: FichesOraleEntrainement,
    },


] as Routes;
