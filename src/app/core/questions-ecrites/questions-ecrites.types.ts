import { Permis } from "src/app/core/permis/permis.types";

export interface Question {
    _id?: string;
    fiche: number;
    numero: number;
    permis: Permis;
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
  permis: Permis;
  mode: 'fiche' | 'aleatoire';
  fiche?: number;
}
