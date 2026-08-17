import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import type { ProductLookupProvider, ProductLookupResult } from './product-lookup.provider';

// OpenFoodFacts' v2 product API is free and keyless — see docs/architecture-plan.md §D/§H
// for why it's the primary barcode source (free + strong India/global packaged-food coverage).
interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    serving_quantity?: number;
    serving_size?: string;
    nutriments?: {
      ['energy-kcal_100g']?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
    };
  };
}

@Injectable()
export class OpenFoodFactsProvider implements ProductLookupProvider {
  private readonly logger = new Logger(OpenFoodFactsProvider.name);
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2/product';

  constructor(private readonly http: HttpService) {}

  async lookupByBarcode(barcode: string): Promise<ProductLookupResult | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<OpenFoodFactsResponse>(`${this.baseUrl}/${barcode}.json`, { timeout: 8000 }),
      );

      const { status, product } = response.data;
      // status 0 means "not found" — a normal, expected outcome for a barcode not in OFF's
      // catalog, not an error condition.
      if (status !== 1 || !product?.product_name) return null;

      const n = product.nutriments ?? {};
      return {
        name: product.product_name,
        brand: product.brands?.split(',')[0]?.trim() || null,
        caloriesPer100g: n['energy-kcal_100g'] ?? 0,
        proteinG: n.proteins_100g ?? 0,
        carbsG: n.carbohydrates_100g ?? 0,
        fatG: n.fat_100g ?? 0,
        fiberG: n.fiber_100g ?? 0,
        servingSizeG: product.serving_quantity ?? null,
        servingUnit: product.serving_size ?? null,
      };
    } catch (err) {
      this.logger.warn(`OpenFoodFacts lookup failed for ${barcode}: ${(err as Error).message}`);
      return null;
    }
  }
}
