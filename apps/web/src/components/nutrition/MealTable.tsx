import type { LoggedMeal } from '@/types/api';

export function MealTable({ meals }: { meals: LoggedMeal[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Meal</th>
            <th className="px-4 py-3">Food</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Calories</th>
            <th className="px-4 py-3">Protein</th>
            <th className="px-4 py-3">Carbs</th>
            <th className="px-4 py-3">Fat</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((meal) => (
            <tr key={meal.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3 text-neutral-500">
                {new Date(meal.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-4 py-3 capitalize text-charcoal-700">{meal.mealType}</td>
              <td className="px-4 py-3 font-medium text-charcoal-900">{meal.foodName}</td>
              <td className="px-4 py-3 text-neutral-500">
                {meal.quantity} {meal.unit}
              </td>
              <td className="px-4 py-3 text-charcoal-900">{meal.calories}</td>
              <td className="px-4 py-3 text-neutral-500">{meal.proteinG}g</td>
              <td className="px-4 py-3 text-neutral-500">{meal.carbsG}g</td>
              <td className="px-4 py-3 text-neutral-500">{meal.fatG}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
