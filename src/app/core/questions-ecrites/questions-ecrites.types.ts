export type PermisType = 'C' | 'CE';

export interface Question {
    _id?: string;
    fiche: number;
    numero: number;
    permis: PermisType;
    question: string;
    reponse: string;
    explication: string;
}

export type Questions = Question[];

export interface QuestionCorrection extends Question {
  reponse: string;
  explication: string;
}

export interface QuestionResult {
  questionId?: string;
  saisie: string;
  reussie: boolean;
}

export interface EntrainementConfig {
  permis: PermisType;
  mode: 'fiche' | 'aleatoire';
  fiche?: number;
}
