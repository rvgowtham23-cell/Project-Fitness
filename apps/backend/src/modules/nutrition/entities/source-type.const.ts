import type { SourceType } from '@fitness/shared-types';

// Kept in its own module (not re-exported from food-item.entity.ts) so entities that need it
// don't form an import cycle with each other — a cycle here left this array `undefined` at
// decorator-evaluation time for whichever entity's module happened to load second.
export const SOURCE_TYPES: SourceType[] = [
  'USDA',
  'IFCT',
  'OPENFOODFACTS',
  'ADMIN',
  'USER',
  'AI_ESTIMATE',
];
