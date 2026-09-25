import type { Locale } from '../config';
import { en, type Dictionary } from './en';
import { fa } from './fa';

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, fa };
