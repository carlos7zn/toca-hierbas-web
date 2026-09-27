import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const GAME_LABELS: Record<string, string> = {
  'assetto-corsa': 'Assetto Corsa',
  acc: 'Assetto Corsa Competizione',
  beamng: 'BeamNG.drive',
  'gta-v': 'GTA V',
  minecraft: 'Minecraft',
  other: 'Otro',
};

export const GAME_COLORS: Record<string, string> = {
  'assetto-corsa': 'neon-cyan',
  acc: 'neon-magenta',
  beamng: 'neon-orange',
  'gta-v': 'neon-green',
  minecraft: 'neon-yellow',
  other: 'border-neon',
};