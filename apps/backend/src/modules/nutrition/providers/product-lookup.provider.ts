// Abstraction so the barcode/product data source can be swapped later (architecture plan §H:
// OpenFoodFacts primary, a commercial provider like Nutritionix as fallback) without touching
// NutritionService or the controller.
export interface ProductLookupResult {
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSizeG: number | null;
  servingUnit: string | null;
}

export const PRODUCT_LOOKUP_PROVIDER = Symbol('PRODUCT_LOOKUP_PROVIDER');

export interface ProductLookupProvider {
  lookupByBarcode(barcode: string): Promise<ProductLookupResult | null>;
}
