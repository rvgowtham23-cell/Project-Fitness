export type MealTypeValue = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// The backend's CreateMealDto requires mealType — none of the log flows (manual, search,
// AI-photo confirm) currently ask the user to pick one, so default from time-of-day. Cheap
// and correct enough for MVP; a real picker on the confirm screen is a natural V1 follow-up.
export function deriveMealTypeFromTime(date: Date = new Date()): MealTypeValue {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
}
