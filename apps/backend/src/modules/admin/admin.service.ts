import { Injectable } from '@nestjs/common';

// TODO(docs/architecture-plan.md §K V2, §L phase 12): full admin panel (user/food/ai-request
// management, system health) is deferred past MVP. Stub only.
@Injectable()
export class AdminService {
  systemHealth(): Promise<{ status: 'ok' }> {
    return Promise.resolve({ status: 'ok' });
  }
}
