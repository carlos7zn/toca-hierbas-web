export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  discordId: string;
  discriminator?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReflexScore {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  reactionTime: number;
  createdAt: Date;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  game: GameType;
  tags: string[];
  likes: number;
  createdAt: Date;
}

export type GameType = 
  | 'assetto-corsa' 
  | 'acc' 
  | 'beamng' 
  | 'gta-v' 
  | 'minecraft' 
  | 'other';

export interface FuelCalculationInput {
  raceTimeMinutes: number;
  consumptionPerLap: number;
  lapTimeMinutes: number;
  lapTimeSeconds: number;
  safetyMargin?: number;
}

export interface FuelCalculationResult {
  totalLaps: number;
  totalFuelLiters: number;
  fuelWithMargin: number;
  recommendedFuel: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  discordId: string;
}