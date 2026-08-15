import { Injectable } from '@nestjs/common';

// TODO(docs/architecture-plan.md §F weekly/monthly rollups, §L phase 11): the nightly
// rollup job and long-term (90d/6mo/1yr) progress views are V1 scope. Stub only — daily
// nutrition rollups already live in nutrition.service.ts since that path had to ship for MVP.
@Injectable()
export class AnalyticsService {
  getWeeklyProgress(_userId: string): Promise<unknown> {
    return Promise.resolve({ status: 'not_implemented' });
  }
}
