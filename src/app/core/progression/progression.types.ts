import { Permis } from "src/app/core/permis/permis.types";

export enum ProgressionType {
  WRITING_QUESTION = 'WRITING_QUESTION',
  ORAL_SHEET = 'ORAL_SHEET',
  THEME = 'THEME',
  VERIFICATION = 'VERIFICATION',
  MANIABILITE = 'MANIABILITE',
  ATTELAGE_DETELAGE = 'ATTELAGE_DETELAGE',
  PLATEAU = 'PLATEAU',
  EXAMEN_BLANC = 'EXAMEN_BLANC',
  CODE_ROUTE = 'CODE_ROUTE',
}

export interface ProgressionStatistique {
  _id: {
    permis: Permis;
    type: ProgressionType;
  };

  travaillees: number;
  reussies: number;
  tentatives: number;
}

export type ProgressionStatistiques = ProgressionStatistique[];

export interface EnregistrerTentativeDto {
  permis: Permis;
  typeOfProgression: ProgressionType;
  elementId: string;
  reussie: boolean;
  score?: number;
}