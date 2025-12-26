
export enum UserRole {
  TRAINEE = 'TRAINEE',
  EXPERT = 'EXPERT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  hasCertificate: boolean; // 射线II/III证书
  hasKnowledge: boolean;   // 射线评片知识
  stats: UserStats;
}

export interface UserStats {
  totalPracticed: number;
  correctCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  defectAccuracy: Record<number, { correct: number; total: number }>;
}

export enum DefectType {
  SLAG = 0,        // 夹渣
  POROSITY = 1,    // 气孔
  CRACK = 2,       // 裂纹
  INCOMPLETE_PENETRATION = 3, // 未焊透
  LACK_OF_FUSION = 4 // 未熔合
}

export const DefectLabels: Record<number, string> = {
  0: '夹渣',
  1: '气孔',
  2: '裂纹',
  3: '未焊透',
  4: '未熔合'
};

export interface BoundingBox {
  type: number;
  x: number; // normalized center x (0-1)
  y: number; // normalized center y (0-1)
  w: number; // normalized width (0-1)
  h: number; // normalized height (0-1)
}

export interface Radiograph {
  id: string;
  filename: string;
  imageUrl: string;
  defects: BoundingBox[];
  difficulty: number; // 1-5
  tag: string;
}

export interface PracticeSession {
  startTime: number;
  correctInSession: number;
  wrongInSession: number;
  imagesViewed: string[];
}
