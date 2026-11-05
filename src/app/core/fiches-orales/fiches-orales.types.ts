import { Permis } from "src/app/core/permis/permis.types";


export interface FicheOraleResume {
    numero: number;
    slug: string;
    titre: string;
    permis: Permis[];
    introduction: string;
}

export interface FicheOrale extends FicheOraleResume {
    sections: FicheOraleSection[];
}

export interface FicheOraleSection {
    id: string;
    titre: string;
    points: FicheOralePoint[];
}

export interface FicheOralePoint {
    id: string;
    ordre: number;
    titre: string;
    cours: FicheOraleCours;
}

export interface FicheOraleCours {
    resume: string;
    risques: string[];
    conseils: string[];
}

export interface FicheOraleEntrainement {
    type: string;
    question: string;
    consigne: string;
    dureeSecondes: number;
}

export interface FicheOraleCritere {
    id: string;
    titre: string;
    explication: string;
    motsCles: string[];
}

export interface FicheOraleCorrection {
    criteres: FicheOraleCritere[];
}

export type FichesOrales = FicheOraleResume[];


// entrainement
export type EtapeEntrainement =
    | 'pret'
    | 'redaction'
    | 'chargement-correction'
    | 'autocorrection'
    | 'resultat';
