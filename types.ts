export enum CutType {
  NONE = '无需加工',
  SINGLE = '单刀',
  DOUBLE = '双刀',
}

export interface TileInput {
  id: string;
  width: number; // cm
  height: number; // cm
  quantity: number;
  bevelWidth: boolean; // Internal bevel on width side
  bevelHeight: boolean; // Internal bevel on height side
}

export interface TileConfig {
  id: string;
  name: string;
  baseWidth: number; // cm
  baseHeight: number; // cm
  cutRate: number; // per cut
  trimRate: number; // per meter
  bevelRate: number; // per meter
}

export interface CalculationResult {
  id: string;
  cutType: CutType;
  cutCount: number;
  cutFee: number;
  
  trimLength: number; // meters
  trimFee: number;
  trimDetails: string; // Explanation of calculation
  
  bevelLength: number; // meters
  bevelFee: number;
  
  totalFee: number;
  
  // Standardized dimensions used for calculation
  finishedLong: number;
  finishedShort: number;
}

export const PRESET_CONFIGS: TileConfig[] = [
  {
    id: '60x120',
    name: '60 × 120 cm',
    baseWidth: 60,
    baseHeight: 120,
    cutRate: 2,
    trimRate: 3,
    bevelRate: 6
  },
  {
    id: '75x150',
    name: '75 × 150 cm',
    baseWidth: 75,
    baseHeight: 150,
    cutRate: 5,
    trimRate: 8,
    bevelRate: 10
  },
  {
    id: '90x180',
    name: '90 × 180 cm',
    baseWidth: 90,
    baseHeight: 180,
    cutRate: 8,
    trimRate: 10,
    bevelRate: 15
  }
];

export const DEFAULT_CONFIG = PRESET_CONFIGS[0];